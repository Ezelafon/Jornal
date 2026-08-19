(()=>{
  const Native=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Native)return;

  const norm=s=>String(s||'').trim().replace(/\s+/g,' ');
  const key=s=>norm(s).toLocaleLowerCase('es');

  function removeRepeatedWords(text){
    const words=norm(text).split(' ').filter(Boolean),out=[];
    for(const word of words){
      if(out.length&&key(out[out.length-1])===key(word))continue;
      out.push(word);
    }
    return out.join(' ');
  }

  function collapseRepeatedBlocks(text){
    let words=removeRepeatedWords(text).split(' ').filter(Boolean),changed=true;
    while(changed){
      changed=false;
      for(let size=Math.min(10,Math.floor(words.length/2));size>=2;size--){
        for(let i=0;i+size*2<=words.length;i++){
          const a=key(words.slice(i,i+size).join(' '));
          const b=key(words.slice(i+size,i+size*2).join(' '));
          if(a===b){words.splice(i+size,size);changed=true;break}
        }
        if(changed)break;
      }
    }
    return words.join(' ');
  }

  function cleanResults(results){
    const cleaned=[];
    let lastFinal='';
    for(let i=0;i<results.length;i++){
      const source=results[i],raw=source?.[0]?.transcript||'';
      let text=collapseRepeatedBlocks(raw);
      if(!text)continue;
      if(source.isFinal){
        const current=key(text),previous=key(lastFinal);
        if(previous&&current===previous)continue;
        if(previous&&current.startsWith(previous+' '))text=text.slice(lastFinal.length).trim();
        if(!text)continue;
        lastFinal=[lastFinal,text].filter(Boolean).join(' ');
      }
      const alt={transcript:text,confidence:source?.[0]?.confidence??0};
      const item={0:alt,length:1,isFinal:!!source.isFinal};
      cleaned.push(item);
    }
    return cleaned;
  }

  function WrappedRecognition(){
    const native=new Native();
    return new Proxy(native,{
      set(target,prop,value){
        if(prop==='onresult'&&typeof value==='function'){
          target.onresult=event=>{
            const results=cleanResults(event.results||[]);
            if(!results.length)return;
            value({...event,results,resultIndex:0});
          };
          return true;
        }
        target[prop]=value;
        return true;
      },
      get(target,prop){
        const value=target[prop];
        return typeof value==='function'?value.bind(target):value;
      }
    });
  }

  WrappedRecognition.prototype=Native.prototype;
  window.SpeechRecognition=WrappedRecognition;
  window.webkitSpeechRecognition=WrappedRecognition;
})();