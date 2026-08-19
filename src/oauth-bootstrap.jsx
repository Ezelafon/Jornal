import{createClient}from'@supabase/supabase-js';

const URL='https://wrtnltpzmjwwgchapkui.supabase.co';
const KEY='sb_publishable_hYp_Dz-JLJ8E8vK4Z1r2dg_BUJ7fmv2';
const supabase=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:false,detectSessionInUrl:false}});

async function bootstrap(){
  try{
    const u=new URL(window.location.href);
    const code=u.searchParams.get('code');
    const hash=new URLSearchParams(window.location.hash.replace(/^#/,''));
    const access=hash.get('access_token');
    const refresh=hash.get('refresh_token');

    if(code){
      await Promise.race([
        supabase.auth.exchangeCodeForSession(code),
        new Promise((_,rej)=>setTimeout(()=>rej(new Error('oauth-timeout')),4000))
      ]);
      u.searchParams.delete('code');
      history.replaceState({},document.title,u.pathname+(u.search||''));
    }else if(access&&refresh){
      await Promise.race([
        supabase.auth.setSession({access_token:access,refresh_token:refresh}),
        new Promise((_,rej)=>setTimeout(()=>rej(new Error('oauth-timeout')),4000))
      ]);
      history.replaceState({},document.title,window.location.pathname+window.location.search);
    }
  }catch(e){
    console.warn('OAuth restore failed',e);
  }finally{
    await import('./main.jsx');
  }
}

bootstrap();