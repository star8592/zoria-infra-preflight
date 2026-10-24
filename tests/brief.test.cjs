const {test}=require("node:test");
const assert=require("node:assert/strict");
const {buildBrief,normalize,SERVICES}=require("../docs/assets/brief.js");
const example={service:"gpu",problem:"CUDA failed to initialize after updating the NVIDIA driver",environment:"Ubuntu 24.04; RTX 5070 Ti; PyTorch 2.x",outcome:"A reproducible GPU smoke test succeeds",constraints:"No driver changes in production"};
test("three supported areas",()=>assert.deepEqual(Object.keys(SERVICES).sort(),["ai","gpu","linux"]));
test("a complete technical brief is readable and locally composed",()=>{
 const text=buildBrief(example);
 assert.match(text,/CUDA failed to initialize/);
 assert.match(text,/NVIDIA GPU \/ CUDA \/ PyTorch/);
 assert.match(text,/No driver changes/);
 assert.match(text,/Nothing has been submitted automatically/);
 assert.match(text,/No passwords/);
});
test("missing categories are rejected",()=>{
 assert.throws(()=>buildBrief({...example,service:"web3"}),/Choose a service/);
});
test("short or missing technical facts are rejected",()=>{
 for(const [name,bad] of [["problem","bad"],["environment","x"],["outcome","no"]]){
  assert.throws(()=>buildBrief({...example,[name]:bad}),/Describe|Add/);
 }
});
test("optional constraints have a safe default",()=>{
 const text=buildBrief({...example,constraints:""});
 assert.match(text,/To be confirmed with the engineer/);
});
test("control characters removed, strings bounded",()=>{
 assert.equal(normalize("ABC\u0000DEF\r\n",6),"ABC DE");
 assert.equal(normalize("X".repeat(3000),1800).length,1800);
});
test("untrusted text kept as plain text, not injected into HTML",()=>{
 const text=buildBrief({...example,problem:"<img src=x onerror=alert(1)> with broken driver and system error"});
 assert.match(text,/<img src=x onerror=alert\(1\)>/);
 assert.equal(typeof text,"string");
});
test("nothing is sent, no network APIs are needed in core",()=>{
 const source=require("node:fs").readFileSync(require("node:path").join(__dirname,"../docs/assets/brief.js"),"utf8");
 assert.doesNotMatch(source,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/);
});
