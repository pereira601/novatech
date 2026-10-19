const $ = (s, root=document) => root.querySelector(s);
$("#year").textContent = new Date().getFullYear();
const menu = $(".menu-toggle"), nav = $("#nav");
menu.addEventListener("click", () => { const open = nav.classList.toggle("open"); menu.setAttribute("aria-expanded", String(open)); });
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add("visible");revealObserver.unobserve(entry.target)}}), {threshold:.12});
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active")); btn.classList.add("active");
  document.querySelectorAll(".project-card").forEach(card => card.hidden = btn.dataset.filter !== "all" && card.dataset.category !== btn.dataset.filter);
}));
const glow = $(".cursor-glow");
window.addEventListener("pointermove", e => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; }, {passive:true});
const canvas = $("#stars"), ctx = canvas.getContext("2d"); let stars = [], w=0,h=0;
function resize(){w=canvas.width=innerWidth*devicePixelRatio;h=canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+"px";canvas.style.height=innerHeight+"px";stars=Array.from({length:Math.min(180,Math.floor(innerWidth/7))},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+.25,a:Math.random()*.7+.15,s:Math.random()*.25+.04}));}
function draw(){ctx.clearRect(0,0,w,h);for(const s of stars){s.y-=s.s*devicePixelRatio;if(s.y<0)s.y=h;ctx.beginPath();ctx.arc(s.x,s.y,s.r*devicePixelRatio,0,Math.PI*2);ctx.fillStyle=`rgba(190,198,255,${s.a})`;ctx.fill()}requestAnimationFrame(draw)}
resize();draw();addEventListener("resize",resize);
$("#contact-form").addEventListener("submit", async e => {
  e.preventDefault(); const form=e.currentTarget, status=$("#form-status"), button=form.querySelector("button");
  status.style.color="#78e6c6"; status.textContent="Envoi en cours…"; button.disabled=true;
  const data=Object.fromEntries(new FormData(form).entries());
  try {
    const r=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    const result=await r.json(); if(!r.ok) throw new Error(result.error || "Une erreur est survenue.");
    status.textContent=result.message; form.reset();
  } catch(err) {status.style.color="#ff9bb5";status.textContent=err.message.includes("Failed to fetch")?"Le serveur n'est pas démarré. Lance le projet avec npm start.":err.message;}
  finally {button.disabled=false;}
});