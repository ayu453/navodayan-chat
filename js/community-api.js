/* Shared backend helpers for Memories and Creativity Corner. */
(()=> {
  const api = window.NV_COMMUNITY_API;
  if (!api) return;
  const bucket = 'navodayan-community';
  const safeName = name => String(name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
  const publicUrl = path => {
    const client = api.getClient();
    if (!client) throw new Error('Please sign in to use community features.');
    return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };
  const uploadWithProgress = async (file, onProgress) => {
    const client = api.getClient(), userId = api.getUserId();
    if (!client || !userId) throw new Error('Please sign in before posting.');
    const session = await api.getSession();
    if (!session?.access_token) throw new Error('Your session expired. Please sign in again.');
    const path = userId + '/' + crypto.randomUUID() + '-' + safeName(file.name);
    const url = (window.parent.NAVODAYAN_SUPABASE_URL || window.NAVODAYAN_SUPABASE_URL || '').replace(/\/$/, '') + '/storage/v1/object/' + bucket + '/' + path.split('/').map(encodeURIComponent).join('/');
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.timeout = 30000;
      xhr.setRequestHeader('Authorization', 'Bearer ' + session.access_token);
      xhr.setRequestHeader('apikey', window.NAVODAYAN_SUPABASE_ANON_KEY || window.parent.NAVODAYAN_SUPABASE_ANON_KEY || '');
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.setRequestHeader('x-upsert', 'false');
      xhr.upload.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100)); };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else { let detail=''; try { const body=JSON.parse(xhr.responseText); detail=body.message || body.error || ''; } catch (_) {} reject(new Error('Storage upload failed (' + xhr.status + ')' + (detail ? ': ' + detail : '. Check Storage policies.'))); }
      };
      xhr.onerror = () => reject(new Error('Network/CORS error during upload. Check the deployed site connection and Supabase Storage URL.'));
      xhr.ontimeout = () => reject(new Error('Upload reached 100% but Supabase did not confirm completion within 30 seconds. Check Storage settings/network and retry.'));
      xhr.onabort = () => reject(new Error('Upload cancelled.'));
      xhr.send(file);
    });
    return { path, url: publicUrl(path) };
  };
  window.NV_SHARED_COMMUNITY = {
    async list(kind) {
      const client = api.getClient();
      if (!client || !api.getUserId()) return [];
      const {data,error}=await client.from('nv_community_posts').select('*').eq('kind',kind).order('created_at',{ascending:false}).limit(100);
      if(error) throw error;
      const ids=(data||[]).map(x=>x.id);
      let reactions=[];
      if(ids.length){const r=await client.from('nv_community_reactions').select('post_id,user_id').in('post_id',ids);if(r.error)throw r.error;reactions=r.data||[];}
      const uid=api.getUserId();
      return (data||[]).map(p=>({...p,media_url:p.media_path?publicUrl(p.media_path):'',reaction_count:reactions.filter(r=>r.post_id===p.id).length,reacted:reactions.some(r=>r.post_id===p.id&&r.user_id===uid)}));
    },
    async publish(values,file,onProgress) {
      const client=api.getClient(), userId=api.getUserId(), profile=api.getProfile();
      if(!client||!userId) throw new Error('Please sign in before posting.');
      let media_path='',media_url='';
      if(file){const uploaded=await uploadWithProgress(file,onProgress);media_path=uploaded.path;media_url=uploaded.url;}
      const row={...values,section:values.section||(values.kind==='memory'?'memories':values.kind==='creation'?'creativity':'community'),user_id:userId,author_name:profile?.name||profile?.username||'Navodayan',media_path,media_type:file?.type||''};
      const saveRequest=client.from('nv_community_posts').insert(row).select('*').single();
      let saveTimer;
      const result=await Promise.race([saveRequest,new Promise((_,reject)=>{saveTimer=setTimeout(()=>reject(new Error('The photo uploaded, but saving the memory is taking too long. Check your Supabase table/policies and try again.')),20000);})]).finally(()=>clearTimeout(saveTimer));
      const {data,error}=result;
      if(error) throw new Error('Photo uploaded, but memory could not be saved: '+error.message);
      return {...data,media_url};
    },
    async toggleReaction(postId, reacted) {
      const client=api.getClient(),userId=api.getUserId();
      if(!client||!userId)throw new Error('Please sign in to react.');
      if(reacted){const {error}=await client.from('nv_community_reactions').delete().eq('post_id',postId).eq('user_id',userId);if(error)throw error;}
      else {const {error}=await client.from('nv_community_reactions').insert({post_id:postId,user_id:userId});if(error)throw error;}
      return !reacted;
    }
  };
})();
