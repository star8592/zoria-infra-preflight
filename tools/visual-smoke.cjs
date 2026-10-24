const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { setTimeout: sleep } = require("node:timers/promises");
const root = path.resolve(process.argv[2] || path.join(__dirname,".."));
const out = process.argv[3] || "/tmp/zoria-visual-qa-final";
const chromeBin = process.env.CHROME_BIN || "/usr/bin/google-chrome";
const port = 19483;
const profile = "/tmp/zoria-visual-qa-19483";
fs.mkdirSync(out,{recursive:true});
function fileUrl(file){return "file://"+path.join(root,"docs",file);}
async function main(){
 const proc=spawn(chromeBin,[
   "--headless=new","--no-sandbox","--disable-gpu","--disable-extensions",
   "--disable-background-networking","--no-first-run","--disable-default-apps",
   "--remote-debugging-address=127.0.0.1","--remote-debugging-port="+port,
   "--user-data-dir="+profile,"about:blank"
 ],{stdio:"ignore"});
 const shutdown=()=>{if(!proc.killed)proc.kill("SIGTERM");};
 process.on("exit",shutdown);
 let target=null;
 for(let i=0;i<60;i++){
   try{
     const resp=await fetch("http://127.0.0.1:"+port+"/json/list");
     if(resp.ok){ const list=await resp.json();target=list.find(v=>v.type==="page"&&v.webSocketDebuggerUrl);if(target)break;}
   }catch{}
   await sleep(150);
 }
 if(!target)throw new Error("isolated browser page not available");
 const ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});});
 let idx=0;const waiters=new Map();
 ws.addEventListener("message",event=>{
   const x=JSON.parse(event.data);if(x.id&&waiters.has(x.id)){
     const job=waiters.get(x.id);waiters.delete(x.id);
     if(x.error)job.reject(new Error(JSON.stringify(x.error)));
     else job.resolve(x.result||{});
   }
 });
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{
   const id=++idx;waiters.set(id,{resolve,reject});
   ws.send(JSON.stringify({id,method,params}));
   setTimeout(()=>{if(waiters.has(id)){waiters.delete(id);reject(new Error(method+" timed out"));}},9000);
 });
 try{
   await cdp("Page.enable");await cdp("Runtime.enable");
   const reports=[];
   for(const [page,width,height] of [
     ["index.html",320,812],["index.html",390,844],["index.html",768,950],["index.html",1440,950],
     ["services/gpu/index.html",320,812],["services/gpu/index.html",390,844],["services/linux/index.html",390,844],
     ["services/ai/index.html",390,844],["start/index.html",320,812],["start/index.html",390,844],["start/index.html",1440,900],["experience/index.html",390,844]
   ]){
     await cdp("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:true});
     await cdp("Page.navigate",{url:fileUrl(page)});
     await sleep(350);
     const r=await cdp("Runtime.evaluate",{expression:"({vw:innerWidth,sw:document.documentElement.scrollWidth,bw:document.body.scrollWidth,title:document.title,cta:[...document.querySelectorAll('a')].filter(a=>a.href.includes('upwork.com')).length,css:!!document.querySelector('link[href*=site-v2]')})",returnByValue:true});
     const v=r.result?.value||{};
     const report={page,width,viewport:v.vw,scrollWidth:v.sw,bodyWidth:v.bw,ctas:v.cta,title:v.title,css:v.css,overflow:Math.max(v.sw||0,v.bw||0)-(v.vw||0)};
     reports.push(report); console.log(JSON.stringify(report));
     if(Math.abs(report.viewport-width)>1)throw new Error("wrong CSS viewport on "+page+" width "+width);
     if(report.overflow>1)throw new Error("horizontal overflow "+JSON.stringify(report));
     if(!report.ctas||!report.css)throw new Error("missing CTA or CSS "+JSON.stringify(report));
     if((width===390 && page.includes("gpu"))||(width===1440&&page==="index.html")||(width===320&&page==="index.html")){
       const ss=await cdp("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
       const filename=page==="index.html"?"home-"+width+".png":"gpu-"+width+".png";
       fs.writeFileSync(path.join(out,filename),Buffer.from(ss.data,"base64"));
     }
   }
   await cdp("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
   await cdp("Page.navigate",{url:fileUrl("start/index.html")+"?service=gpu"});
   await sleep(450);
   const ui=await cdp("Runtime.evaluate",{expression:"(()=>{const f=document.getElementById('brief-form');if(!f)return {error:'missing form'};const selected=document.getElementById('service').value;f.elements.namedItem('problem').value='After a driver update our GPU workload fails with a CUDA initialization error.';f.elements.namedItem('environment').value='Ubuntu 24.04, NVIDIA GPU, CUDA and PyTorch';f.elements.namedItem('outcome').value='The GPU smoke test succeeds consistently';f.requestSubmit();return {selected,visible:!document.getElementById('brief-result').hidden,hasOutput:document.getElementById('brief-output').value.includes('PROJECT BRIEF'),hasError:document.getElementById('brief-status').dataset.state==='error'};})()",returnByValue:true});
   const uiv=ui.result?.value||{};
   console.log("BRIEF_UI",JSON.stringify(uiv));
   if(uiv.selected!=="gpu"||!uiv.visible||!uiv.hasOutput||uiv.hasError)throw new Error("project brief UI failed "+JSON.stringify(uiv));
   const screenshot=await cdp("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
   fs.writeFileSync(path.join(out,"brief-390.png"),Buffer.from(screenshot.data,"base64"));
   fs.writeFileSync(path.join(out,"layout-report.json"),JSON.stringify(reports,null,2));
   console.log("PASS: "+reports.length+" real CDP viewport checks (320/390/768/1440), no horizontal overflow");
 }finally{
   ws.close();shutdown();
 }
}
main().catch(err=>{console.error(err);process.exitCode=1;});
