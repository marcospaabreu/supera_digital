import * as THREE from './vendor/three.module.min.js';
const host=document.querySelector('.sculpture');
try {
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.25;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(35,1,.1,50);
 camera.position.set(0,1.4,8.2);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xeaf2ff,0x52644a,2.2));
 const key=new THREE.DirectionalLight(0xffffff,4.5);key.position.set(-3,5,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=4;key.shadow.camera.bottom=-4;key.shadow.normalBias=.025;scene.add(key);
 const rim=new THREE.DirectionalLight(0xa4c7ff,3);rim.position.set(4,1,-2);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xffffff,1.1);fill.position.set(2,-1,4);scene.add(fill);
 const object=new THREE.Group();object.rotation.set(.3,-.4,-.25);scene.add(object);
 const blue=new THREE.MeshPhysicalMaterial({color:0x2452e8,metalness:.28,roughness:.22,clearcoat:1,clearcoatRoughness:.15});
 const lightBlue=new THREE.MeshPhysicalMaterial({color:0x7196ff,metalness:.35,roughness:.24,clearcoat:1});
 const rings=[ [1.5,.105,.35,.25,0], [1.25,.12,1.1,-.65,.25], [1.02,.09,-.8,.8,.2] ];
 rings.forEach(([radius,tube,x,y,z],i)=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,24,100),i===1?lightBlue:blue);ring.rotation.set(x,y,z);ring.castShadow=true;ring.receiveShadow=true;object.add(ring)});
 const core=new THREE.Mesh(new THREE.SphereGeometry(.56,48,32),blue);core.castShadow=true;core.receiveShadow=true;object.add(core);
 const silver=new THREE.MeshPhysicalMaterial({color:0xf0f5ff,metalness:.4,roughness:.2});
 const arrow=new THREE.Group();const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.48,16),silver);shaft.position.y=-.05;const head=new THREE.Mesh(new THREE.ConeGeometry(.115,.22,3),silver);head.position.y=.28;arrow.add(shaft,head);arrow.rotation.z=-Math.PI/4;arrow.position.z=.55;object.add(arrow);
 const satellite=new THREE.Mesh(new THREE.SphereGeometry(.12,24,16),silver);satellite.position.set(1.4,.6,.25);satellite.castShadow=true;object.add(satellite);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(15,15),new THREE.ShadowMaterial({opacity:.18}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.9;floor.receiveShadow=true;scene.add(floor);
 let drag=false,lastX=0,lastY=0,visible=true,lost=false,raf=0,previous=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const paused=()=>reduced.matches||document.body.classList.contains('paused');
 function paint(){renderer.render(scene,camera)}
 function tick(time){raf=0;if(lost||!visible||document.hidden)return;const dt=Math.min((time-previous)/1000,.04);previous=time;if(!drag&&!paused()){object.rotation.y+=dt*.23;object.position.y=Math.sin(time*.0005)*.055}paint();if(!paused()||drag)raf=requestAnimationFrame(tick)}
 function wake(){if(!raf&&!lost){previous=performance.now();raf=requestAnimationFrame(tick)}}
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();wake()}
 new ResizeObserver(resize).observe(host);
 host.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag=true;lastX=e.clientX;lastY=e.clientY;host.setPointerCapture(e.pointerId);wake()});
 host.addEventListener('pointermove',e=>{if(!drag)return;object.rotation.y+=(e.clientX-lastX)*.009;object.rotation.x=Math.max(-1.3,Math.min(1.3,object.rotation.x+(e.clientY-lastY)*.007));lastX=e.clientX;lastY=e.clientY;host.setAttribute('aria-valuenow',String(Math.round((object.rotation.y*180/Math.PI%360+360)%360)));wake()});
 ['pointerup','pointercancel','lostpointercapture'].forEach(type=>host.addEventListener(type,()=>{drag=false}));
 host.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home')object.rotation.set(.3,-.4,-.25);else if(e.key==='ArrowLeft'||e.key==='ArrowRight')object.rotation.y+=(e.key==='ArrowRight'?1:-1)*.2;else object.rotation.x+=(e.key==='ArrowDown'?1:-1)*.2;host.setAttribute('aria-valuenow',String(Math.round((object.rotation.y*180/Math.PI%360+360)%360)));wake()});
 new MutationObserver(wake).observe(document.body,{attributes:true,attributeFilter:['class']});
 reduced.addEventListener('change',wake);
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake()}).observe(host);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake()});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;host.classList.remove('webgl-ready')});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;host.classList.add('webgl-ready');wake()});
 host.append(renderer.domElement);resize();paint();host.classList.add('webgl-ready');host.setAttribute('aria-label','Escultura 3D: arraste para girar ou use as setas do teclado');wake();
} catch(error){host.dataset.renderer='fallback';console.warn('3D indisponível; exibindo ilustração alternativa.',error)}