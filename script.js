'use strict';
const sneakerSource='aura-white.png';
const DELIVERY=60;
const CART_KEY='aura-cart';
document.querySelectorAll('[data-sneaker]').forEach(i=>i.src=sneakerSource);
const hero=document.querySelector('.hero');
const shoe=document.querySelector('.floating-shoe');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let frame=0;
if(hero&&shoe){
hero.addEventListener('pointermove',e=>{
if(reduceMotion.matches||e.pointerType==='touch')return;
const b=hero.getBoundingClientRect();
const x=Math.max(-1,Math.min(1,((e.clientX-b.left)/b.width-.5)*2));
const y=Math.max(-1,Math.min(1,((e.clientY-b.top)/b.height-.5)*2));
cancelAnimationFrame(frame);
frame=requestAnimationFrame(()=>{shoe.style.transform=`translate3d(${x*9}px,${y*5-4}px,0) rotateX(${-y*5}deg) rotateY(${x*7}deg)`;});
});
const reset=()=>{cancelAnimationFrame(frame);shoe.style.transform='translate3d(0,0,0) rotateX(0deg) rotateY(0deg)';};
hero.addEventListener('pointerleave',reset);
window.addEventListener('blur',reset);
}
function getCart(){try{return JSON.parse(localStorage.getItem(CART_KEY))||[];}catch{return[];}}
function saveCart(c){localStorage.setItem(CART_KEY,JSON.stringify(c));updateBagCount();}
function updateBagCount(){const n=getCart().reduce((s,i)=>s+i.qty,0);document.querySelectorAll('.bag-count').forEach(el=>{el.textContent=n;el.setAttribute('data-count',n);});}
function money(c){return'R '+(c/100).toFixed(0);}
let selectedSize=null;
const sizeButtons=document.querySelectorAll('.size');
const addButton=document.querySelector('.add-to-bag');
if(sizeButtons.length){
sizeButtons.forEach(b=>b.addEventListener('click',()=>{
sizeButtons.forEach(x=>x.classList.remove('active'));
b.classList.add('active');
selectedSize=Number(b.dataset.size);
if(addButton)addButton.disabled=false;
}));
}
if(addButton){
addButton.addEventListener('click',()=>{
if(!selectedSize)return;
const cart=getCart();
const existing=cart.find(i=>i.id==='aura-01'&&i.size===selectedSize);
if(existing)existing.qty+=1;
else cart.push({id:'aura-01',name:'Aura 01',size:selectedSize,price:89900,qty:1});
saveCart(cart);
addButton.textContent='Added ✓';
setTimeout(()=>{addButton.textContent='Add to bag';},1400);
});
}
const cartItems=document.querySelector('#cart-items');
if(cartItems){
const cart=getCart();
const subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
const delivery=cart.length?DELIVERY*100:0;
const total=subtotal+delivery;
document.querySelector('#subtotal').textContent=money(subtotal);
document.querySelector('#delivery').textContent=money(delivery);
document.querySelector('#total').textContent=money(total);
if(!cart.length){cartItems.innerHTML='<div class="empty-bag"><h2>Your bag is empty.</h2><a class="cta" href="index.html#collection">Explore the drop</a></div>';}
else{
cartItems.innerHTML=cart.map(item=>`
<div class="cart-item">
<img src="${sneakerSource}" alt="${item.name}">
<div class="cart-item-info">
<h3>${item.name}</h3>
<p>UK / SA ${item.size}</p>
<div class="cart-item-qty">
<button data-action="dec" data-size="${item.size}">−</button>
<span>${item.qty}</span>
<button data-action="inc" data-size="${item.size}">+</button>
</div>
<button class="cart-item-remove" data-action="remove" data-size="${item.size}">Remove</button>
</div>
<div class="cart-item-price">${money(item.price*item.qty)}</div>
</div>`).join('');
cartItems.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
const action=b.dataset.action;
const size=Number(b.dataset.size);
let c=getCart();
const item=c.find(i=>i.size===size);
if(!item)return;
if(action==='inc')item.qty+=1;
if(action==='dec'){item.qty-=1;if(item.qty<1)c=c.filter(i=>i.size!==size);}
if(action==='remove')c=c.filter(i=>i.size!==size);
saveCart(c);
location.reload();
}));
}
}
updateBagCount();

const checkoutForm=document.querySelector('#checkout-form');
if(checkoutForm){
const cart=getCart();
const checkoutItems=document.querySelector('#checkout-items');
if(!cart.length){location.href='cart.html';}
else{
const subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
const delivery=DELIVERY*100;
const total=subtotal+delivery;
checkoutItems.innerHTML=cart.map(i=>`<div class="checkout-item"><div><strong>${i.name}</strong><p>UK / SA ${i.size} · Qty ${i.qty}</p></div><span>${money(i.price*i.qty)}</span></div>`).join('');
document.querySelector('#subtotal').textContent=money(subtotal);
document.querySelector('#delivery').textContent=money(delivery);
document.querySelector('#total').textContent=money(total);
}
checkoutForm.addEventListener('submit',e=>{
e.preventDefault();
const form=e.currentTarget;
const err=document.querySelector('#form-error');
const data=Object.fromEntries(new FormData(form));
if(!data.name||data.name.length<2)return showErr('Enter your full name.');
if(!/^\S+@\S+\.\S+$/.test(data.email))return showErr('Enter a valid email.');
if(!data.phone||data.phone.length<9)return showErr('Enter a valid phone number.');
if(!data.street||data.street.length<5)return showErr('Enter your street address.');
if(!data.city)return showErr('Enter your city.');
if(!/^\d{4}$/.test(data.postal))return showErr('Enter a four-digit postal code.');
if(!data.province)return showErr('Select your province.');
function showErr(msg){err.textContent=msg;err.style.display='block';}
err.style.display='none';
localStorage.removeItem(CART_KEY);
document.querySelector('#checkout-view').style.display='none';
document.querySelector('#checkout-done').style.display='block';
window.scrollTo(0,0);
updateBagCount();
});
}