import{createClient}from'@supabase/supabase-js';

const supabase=createClient(
  'https://wrtnltpzmjwwgchapkui.supabase.co',
  'sb_publishable_hYp_Dz-JLJ8E8vK4Z1r2dg_BUJ7fmv2',
  {auth:{flowType:'implicit',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
);

// En iOS/WhatsApp/Safari el flujo PKCE puede perder el verifier al cambiar de contexto.
// Capturamos el botón de Google y forzamos implicit, que devuelve los tokens en el hash
// y no depende de sessionStorage entre el inicio y el callback.
document.addEventListener('click',async e=>{
  const button=e.target?.closest?.('button');
  if(!button)return;
  if((button.textContent||'').trim()!=='Continuar con Google')return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  button.disabled=true;
  const original=button.textContent;
  button.textContent='Abriendo Google…';
  try{
    const{error}=await supabase.auth.signInWithOAuth({
      provider:'google',
      options:{redirectTo:window.location.origin}
    });
    if(error)throw error;
  }catch(err){
    console.error('Google OAuth',err);
    button.disabled=false;
    button.textContent=original;
  }
},true);