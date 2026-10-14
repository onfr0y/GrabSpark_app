import {calculate, scenarios} from './model.mjs';
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat('en-GB', {style:'currency',currency:'THB',currencyDisplay:'narrowSymbol',maximumFractionDigits:2}).format(n);
const number = n => new Intl.NumberFormat('en-GB',{maximumFractionDigits:2}).format(n);
const recovery = n => n === null ? 'Not recoverable' : n === 0 ? '0 (no setup)' : n < .01 ? '< 0.01 days' : `${number(n)} ${n === 1 ? 'day' : 'days'}`;
let selected = 1;
let current;
function switchView(view, focus=true) {
  document.querySelectorAll('.panel').forEach((panel,i)=>panel.classList.toggle('active',i===view));
  document.querySelectorAll('nav button').forEach((b,i)=>i===view?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));
  if(focus) document.querySelectorAll('.section-heading h2')[view].focus();
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>switchView(Number(b.dataset.view))));
function read() {
  const fields = ['name','price','cost','orders','setup','days'];
  let invalid = false;
  fields.forEach(id=>{const el=$(id);const ok=el.checkValidity()&&(id!=='name'||el.value.trim().length>0);el.setAttribute('aria-invalid',String(!ok));invalid ||= !ok;});
  $('error').hidden=!invalid;
  $('error').textContent=invalid?'Enter a menu name and valid amounts. Use non-negative values, at most two decimal places for money, and whole orders. Orders are limited to 100,000/day.':'';
  ['result-content','scenario-content'].forEach(id=>{$(id).hidden=invalid;});
  if(invalid){$('live-status').textContent='Results unavailable. Please correct the highlighted inputs.';return null;}
  return Object.fromEntries(['price','cost','orders','setup','days'].map(id=>[id,Number($(id).value)]));
}
function lineChart(input,result) {
  const d=Number($('inspect-day').value);
  const lo=Math.min(-input.setup,result.afterSetup,0), hi=Math.max(0,result.afterSetup,-input.setup);
  const padding=Math.max((hi-lo)*.12,1), min=lo-padding,max=hi+padding;
  const y=v=>155-(v-min)/(max-min)*125, x=t=>52+t/input.days*244;
  const ticks=[lo,(lo+hi)/2,hi].filter((v,i,a)=>a.indexOf(v)===i);
  $('line-chart').innerHTML=`<svg viewBox="0 0 320 194" role="img" aria-label="Contribution after setup from day zero to day ${input.days}. Use the day slider for exact values."><text x="52" y="14">THB</text>${ticks.map(v=>`<line x1="52" x2="296" y1="${y(v)}" y2="${y(v)}" stroke="#e4e9e2"/><text x="46" y="${y(v)+3}" text-anchor="end">${number(v)}</text>`).join('')}<line x1="52" x2="296" y1="${y(0)}" y2="${y(0)}" stroke="#a8b9a9" stroke-dasharray="3 3"/><path d="M52 ${y(-input.setup)} L296 ${y(result.afterSetup)} L296 ${y(0)} L52 ${y(0)}Z" fill="#e6f4e9"/><path d="M52 ${y(-input.setup)} L296 ${y(result.afterSetup)}" stroke="#007c49" stroke-width="2.5" fill="none"/><line x1="${x(d)}" x2="${x(d)}" y1="30" y2="155" stroke="#8cab95" stroke-dasharray="3 3"/><circle cx="${x(d)}" cy="${y(result.daily*d-input.setup)}" r="4" fill="#007c49"/><text x="52" y="174">0</text><text x="296" y="174" text-anchor="end">${input.days}</text><text x="174" y="190" text-anchor="middle">Trading days</text></svg>`;
  $('day-detail').textContent=`Day ${d}: ${money(result.daily*d-input.setup)} after setup (${number(input.orders*d)} orders).`;
}
function barChart(rows,input) {
  const values=rows.map(r=>r.afterSetup),low=Math.min(0,...values),high=Math.max(0,...values),pad=Math.max((high-low)*.2,1);
  const y=v=>154-(v-low+pad)/(high-low+2*pad)*120;
  $('bar-chart').innerHTML=`<svg viewBox="0 0 320 190" role="img" aria-label="Contribution after setup comparison. Exact values are in the comparison table."><line x1="12" x2="308" y1="${y(0)}" y2="${y(0)}" stroke="#b6c2b6"/><text x="12" y="20">THB · ${input.days} trading ${input.days===1?'day':'days'}</text>${rows.map((r,i)=>`<rect x="${29+i*99}" y="${Math.min(y(r.afterSetup),y(0))}" width="62" height="${Math.max(1,Math.abs(y(r.afterSetup)-y(0)))}" rx="3" fill="${r.afterSetup<0?'#df9586':i===selected?'#007c49':'#a8d4b1'}"/><text x="${60+i*99}" y="${r.afterSetup>=0?y(r.afterSetup)-7:y(r.afterSetup)+14}" text-anchor="middle">${number(r.afterSetup)}</text><text x="${60+i*99}" y="179" text-anchor="middle">${r.name}</text>`).join('')}</svg>`;
}
function update() {
  const input=read(); current=input;if(!input)return;
  const result=calculate(input),rows=scenarios(input,Number($('spread').value));
  $('orders-slider').max=Math.max(100,input.orders);$('orders-slider').value=input.orders;$('range-max').textContent=`${$('orders-slider').max} orders`;
  $('inspect-day').max=input.days;if(Number($('inspect-day').value)>input.days)$('inspect-day').value=input.days;
  $('result-subtitle').textContent=`${$('name').value.trim()} · ${input.days} trading ${input.days===1?'day':'days'}`;
  $('margin').textContent=money(result.margin);$('margin-equation').textContent=`${money(input.price)} price − ${money(input.cost)} variable cost`;
  $('recover-orders').textContent=result.recoveryOrders===null?'Not recoverable':number(result.recoveryOrders);
  $('recover-days').textContent=recovery(result.recoveryDays);$('daily').textContent=money(result.daily);
  $('total-label').textContent=`Total contribution · ${input.days} ${input.days===1?'day':'days'}`;$('total').textContent=money(result.total);$('setup-total').textContent=money(input.setup);$('after-setup').textContent=money(result.afterSetup);
  $('feedback').textContent=result.margin<0?`Each order loses ${money(-result.margin)} before fixed costs. More orders deepen the shortfall. Explore price or variable cost before increasing volume.`:result.margin===0?'Each order covers only its variable cost. No contribution remains to cover setup or fixed costs.':input.orders===0?`Each order could contribute ${money(result.margin)}, but zero orders generate no contribution. A positive setup expense cannot be recovered at this sales level.`:input.setup===0?`There is no setup expense to recover. Each order contributes ${money(result.margin)} towards fixed costs and eventual profit.`:`You need ${number(result.recoveryOrders)} whole orders to cover setup. At ${number(input.orders)} orders/day, that is ${recovery(result.recoveryDays)} at a steady sales rate, or ${Math.ceil(result.recoveryDays)} full trading ${Math.ceil(result.recoveryDays)===1?'day':'days'} when reporting at day-end. Each extra order contributes ${money(result.margin)} before fixed costs.`;
  $('spread-label').textContent=`±${$('spread').value}%`;
  $('scenario-buttons').innerHTML=rows.map((r,i)=>`<button type="button" data-scenario="${i}" aria-pressed="${i===selected}">${r.name}<small>${number(r.orders)} orders/day</small></button>`).join('');
  $('scenario-buttons').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{selected=Number(b.dataset.scenario);update();$('scenario-buttons').children[selected].focus();}));
  $('bar-title').textContent=`Contribution after setup · ${input.days} ${input.days===1?'day':'days'}`;
  const r=rows[selected];$('selected-detail').textContent=`${r.name}: ${money(r.total)} contribution − ${money(input.setup)} setup = ${money(r.afterSetup)} across ${input.days} trading ${input.days===1?'day':'days'}.`;
  $('table-caption').textContent=`Totals over ${input.days} trading ${input.days===1?'day':'days'}; recovery assumes this daily rate continues.`;
  const entries=[['Orders/day',r=>number(r.orders)],['Revenue',r=>money(r.revenue)],['Variable costs',r=>money(r.variable)],['Daily contribution',r=>money(r.daily)],['Total contribution',r=>money(r.total)],['After setup',r=>money(r.afterSetup)],['Days to recover',r=>recovery(r.recoveryDays)]];
  $('scenario-table').innerHTML=entries.map(([label,format])=>`<tr><th scope="row">${label}</th>${rows.map(r=>`<td>${format(r)}</td>`).join('')}</tr>`).join('');
  lineChart(input,result);barChart(rows,input);
  $('live-status').textContent=`Results updated. Contribution per order ${money(result.margin)}. Contribution after setup ${money(result.afterSetup)}.`;
}
$('inputs').addEventListener('input',update);
$('inputs').addEventListener('submit',e=>{e.preventDefault();update();if(current)switchView(1);else document.querySelector('[aria-invalid=true]').focus();});
$('orders-slider').addEventListener('input',()=>{$('orders').value=$('orders-slider').value;update();});
$('spread').addEventListener('input',update);
$('inspect-day').addEventListener('input',()=>{if(current)lineChart(current,calculate(current));});
$('reset-example').addEventListener('click',()=>{$('inputs').reset();$('spread').value=50;$('inspect-day').value=1;selected=1;$('quiz-feedback').textContent='';document.querySelectorAll('[data-answer]').forEach(b=>b.removeAttribute('aria-pressed'));update();});
document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-answer]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('quiz-feedback').textContent=b.dataset.answer==='right'?'Correct. With positive contribution and setup expense, fewer daily orders mean slower recovery. Contribution per order stays price minus variable cost. With zero setup there is nothing to recover; with non-positive contribution, positive setup cannot be recovered.':'Try again. Contribution per order depends on price and variable cost, which stay fixed here. Daily volume changes how quickly you can cover setup.';}));
update();

document.querySelectorAll('[data-field]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-field]').forEach(b=>b.classList.toggle('selected',b===button));$(button.dataset.field).focus();}));
