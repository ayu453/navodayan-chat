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
    const url = (window.NAVODAYAN_SUPABASE_URL || '').replace(/\/$/, '') + '/storage/v1/object/' + bucket + '/' + path.split('/').map(encodeURIComponent).join('/');
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.setRequestHeader('Authorization', 'Bearer ' + session.access_token);
      xhr.setRequestHeader('apikey', window.NAVODAYAN_SUPABASE_ANON_KEY || '');
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.setRequestHeader('x-upsert', 'false');
      xhr.upload.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100)); };
      xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload failed (' + xhr.status + '). Check Storage policies.'));
      xhr.onerror = () => reject(new Error('Network error during upload.'));
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
      const row={...values,user_id:userId,author_name:profile?.name||profile?.username||'Navodayan',media_path,media_type:file?.type||''};
      const {data,error}=await client.from('nv_community_posts').insert(row).select('*').single();
      if(error) throw error;
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
