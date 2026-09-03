const http=require('http');
const fs=require('fs');
const path=require('path');
const os=require('os');
const PORT=process.env.PORT||3000;
const PUBLIC_DIR=path.join(__dirname,'public');
const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.ico':'image/x-icon'};
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,`http://localhost:${PORT}`);
  let rel=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const filePath=path.normalize(path.join(PUBLIC_DIR,rel));
  if(!filePath.startsWith(PUBLIC_DIR)){res.writeHead(403);return res.end('Acesso negado');}
  fs.readFile(filePath,(err,data)=>{
    if(err){res.writeHead(404);return res.end('Arquivo não encontrado');}
    res.writeHead(200,{'Content-Type':MIME[path.extname(filePath)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});
    res.end(data);
  });
});
server.listen(PORT,'0.0.0.0',()=>{
  console.log(`CS Têxtil disponível em http://localhost:${PORT}`);
  Object.values(os.networkInterfaces()).flat().filter(i=>i&&i.family==='IPv4'&&!i.internal).forEach(i=>console.log(`Rede local: http://${i.address}:${PORT}`));
});
