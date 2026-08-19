import{createClient}from'@supabase/supabase-js';

const SUPABASE_URL='https://wrtnltpzmjwwgchapkui.supabase.co';
const SUPABASE_KEY='sb_publishable_hYp_Dz-JLJ8E8vK4Z1r2dg_BUJ7fmv2';

const authClient=createClient(SUPABASE_URL,SUPABASE_KEY,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});

async function restoreOAuthSession(){
  try{
    const url=new URL(window.location.href);
    const code=url.searchParams.get('code');
    const hasOAuthHash=window.location.hash.includes('access_token=')||window.location.hash.includes('refresh_token=');

    if(code){
      const{error}=await authClient.auth.exchangeCodeForSession(code);
      if(!error){
        url.searchParams.delete('code');
        window.history.replaceState({},document.title,url.pathname+(url.search||''));
      }
    }else if(hasOAuthHash){
      // Supabase procesa el hash durante la inicialización del cliente.
      await authClient.auth.getSession();
      window.history.replaceState({},document.title,window.location.pathname+window.location.search);
    }else{
      await authClient.auth.getSession();
    }

    // Safari/iOS puede tardar un instante en persistir la sesión después del redirect.
    for(let i=0;i<6;i++){
      const{data}=await authClient.auth.getSession();
      if(data.session)break;
      await new Promise(r=>setTimeout(r,150));
    }
  }catch(e){
    console.warn('OAuth bootstrap:',e);
  }finally{
    await import('./main.jsx');
  }
}

restoreOAuthSession();