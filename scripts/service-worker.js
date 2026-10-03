'use strict';
// No DOM, jQuery, localStorage, remotely loaded code or persistent memory required.
const colors = ['#C3ACEA','#FFC5CC','#F6D863','#FCF3CA','#B9E4C9','#90F3E8','#8FCAF2','#293990','#191D2D','#111111','#F5F5F5']
    .map((color,i)=>({id:i+1,color,text_color:[3,10].includes(i)?'dark':'light'}));
async function settings() {
    const store = await chrome.storage.sync.get(null);
    const defaults = {monoColors:colors,whatsnew:[],autopilotWhitelist:[],bgType:'default',photoRotation:false};
    const missing = Object.fromEntries(Object.entries(defaults).filter(([k])=>store[k] === undefined));
    if (Object.keys(missing).length) await chrome.storage.sync.set(missing);
    return {...defaults,...store};
}
async function send(tabId,method,data) {
    if (!Number.isInteger(tabId)) return;
    try { return await chrome.tabs.sendMessage(tabId,{method,data}); }
    catch (_) { /* Restricted pages and tabs without content scripts are expected. */ }
}
async function toggle(tab) {
    await send(tab?.id,'openReaderMode');
    await chrome.storage.sync.set({version:'v0.9.4'});
}
// Register every event synchronously on every worker start.
chrome.action.onClicked.addListener(toggle);
chrome.contextMenus.onClicked.addListener((info,tab)=>{
    if(info.menuItemId === 'fikaReaderMode') toggle(tab);
});
chrome.runtime.onInstalled.addListener(()=>{
    chrome.contextMenus.removeAll(()=>{
        chrome.contextMenus.create({id:'fikaReaderMode',title:'Toggle Fika',contexts:['page','selection'],documentUrlPatterns:['http://*/*','https://*/*']});
    });
    settings().catch(console.error);
});
chrome.tabs.onActivated.addListener(info=>send(info.tabId,'checkAvailable'));
async function api(endpoint, data, method='GET') {
    const url = new URL('https://www.yuiapi.com/api/v1/'+endpoint);
    const opts = {method,signal:AbortSignal.timeout(6000)};
    if(method==='GET') for(const [k,v] of Object.entries(data||{})) url.searchParams.set(k,v);
    else {opts.headers={'Content-Type':'application/x-www-form-urlencoded'};opts.body=new URLSearchParams(data);}
    const response=await fetch(url,opts);
    if(!response.ok) throw new Error('Fika service HTTP '+response.status);
    return response.json();
}
async function photos(more=false) {
    const cached = await chrome.storage.local.get(['photos','photoFetched','photoPage','photoComplete']);
    const list = cached.photos || [];
    if (!more && cached.photoFetched && Date.now()-cached.photoFetched < 86400000) return list;
    if (more && cached.photoComplete) return list;
    const page = more ? (cached.photoPage || 1)+1 : 1;
    try {
        const response = await api('fika/background',{page_index:page,page_size:32});
        const payload=response.data || response;
        if(!Array.isArray(payload.list)) throw new Error('Invalid photo response');
        const next=more ? [...list,...payload.list.filter(p=>!list.some(x=>x.id===p.id))] : payload.list;
        await chrome.storage.local.set({photos:next,photoPage:page,photoFetched:Date.now(),photoComplete:payload.list.length<32 || next.length>=payload.row_count});
        const store=await settings();
        if(!more && store.photoRotation && store.bgType==='photo' && next.length>1) {
            const candidates=next.filter(p=>p.id!==store.bg?.id);
            if(candidates.length) await chrome.storage.sync.set({bg:candidates[Math.floor(Math.random()*candidates.length)]});
        }
        return next;
    } catch(error) {
        // Failed legacy services must never prevent article reading.
        await chrome.storage.local.set({photoFetched:Date.now()});
        return list;
    }
}
const handlers = {
    async reader_ready(data,sender) {
        if(sender.tab) await chrome.action.setIcon({tabId:sender.tab.id,path:{64:data?.is_available?'images/logo64.png':'images/logo64-grey.png'}});
        return '';
    },
    async new_badge(data,sender) {if(sender.tab) await chrome.action.setBadgeText({tabId:sender.tab.id,text:'new'});return true;},
    async is_open(data,sender) {if(sender.tab) await chrome.action.setBadgeText({tabId:sender.tab.id,text:data?'on':''});return !!data;},
    async setCache(data) {await chrome.storage.local.set({['cache:'+data.key]:String(data.value)});return '';},
    async getCache(data) {
        const keys=Array.isArray(data.key)?data.key:[data.key];
        const saved=await chrome.storage.local.get(keys.map(k=>'cache:'+k));
        return keys.map(k=>saved['cache:'+k] ?? null);
    },
    async getPhotoSrc() {
        await settings();
        // Return immediately; fetching legacy photos runs separately.
        const saved=await chrome.storage.local.get('photos');
        return saved.photos || [];
    },
    async fetchData(data,sender) {await settings();const list=await photos();await send(sender.tab?.id,'updatePhotoSrc',list);return '';},
    async loadMorePhotoSrc(data,sender) {await send(sender.tab?.id,'updatePhotoSrc',await photos(true));return '';},
    async sendGA() {return '';}, // Legacy remote analytics intentionally removed.
    async feedback(data,sender) {
        let success=false;
        try {success=(await api('fika/feedback',{url:sender.tab?.url||'',is_match:data.is_match},'POST')).code===0;} catch(_) {}
        await send(sender.tab?.id,'feedbackResponse',{is_match:data.is_match,success});return '';
    },
    async oauth(data,sender) {
        await send(sender.tab?.id,'loginFailed',1);return {error:'Google sign-in requires an OAuth client configured for this extension ID.'};
    },
    async getUserStore(data,sender) {await send(sender.tab?.id,'loginUser',await settings());return '';},
    async changeUserType() {return {error:'Legacy account upgrades are unavailable in this personal build.'};},
    async updateWhitelist() {return '';}, // The existing reader saves its list to storage.sync.
};
chrome.runtime.onMessage.addListener((request,sender,respond)=>{
    if(sender.id!==chrome.runtime.id || !Object.hasOwn(handlers,request?.method)) return false;
    Promise.resolve().then(()=>handlers[request.method](request.data,sender)).then(respond,error=>{
        console.error('Fika:',request.method,error);respond({error:String(error.message||error)});
    });
    return true; // Keep asynchronous storage/fetch response channels open.
});
