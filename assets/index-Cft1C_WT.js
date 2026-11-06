(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e,t,n,r,i,a,o,s,c,l,u,d=Symbol.for(`pv`),f={},p=[],m=/^m(i|n|o|s|text|space)$/,h=Array.isArray,g=p.slice,_=Object.assign;function v(e){e&&e.parentNode&&e.remove()}function y(e,t,n){var r,i,a,o={},s=arguments.length;for(a in t)a==`key`?r=t[a]:a==`ref`&&typeof e!=`function`?i=t[a]:o[a]=t[a];return s>2&&(o.children=s>3?g.call(arguments,2):n),b(e,o,r,i,null)}function b(n,r,i,a,o){var s={type:n,props:r,key:i,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:d,__v:o||++t,__i:-1,__u:0};return!o&&e.vnode&&e.vnode(s),s}function x(e){return e.children}function S(e,t){this.props=e,this.context=t,this.__g=0}function C(e,t){if(t==null)return e.__&&C(e.__,e.__i+1);for(var n;t<e.__k.length;t++)if((n=e.__k[t])&&n.__e)return n.__e;return typeof e.type!=`function`||e.props.__P?null:C(e)}function w(e){if((e=e.__)&&e.__c&&!e.props.__P)return e.__e=null,e.__k.some(function(t){return t&&(e.__e=t.__e)}),w(e)}function T(t){(8&t.__g||(t.__g|=8,r.push(t),a++))&&i==e.debounceRendering||((i=e.debounceRendering)||queueMicrotask)(E)}function E(){var t,n,s,c,l,u,f,p,m;try{for(n=1;r.length;)r.length>n&&r.sort(o),t=r.shift(),n=r.length,8&t.__g&&(c=void 0,l=void 0,u=(l=(s=t).__v).__e,f=[],p=[],(m=s.__P)&&((c=_({constructor:d},l)).__v=l.__v+1,e.vnode&&e.vnode(c),M(m,c,l,s.__n,m.namespaceURI,32&l.__u?[u]:null,f,u||C(l),32&l.__u,p),c.__v=l.__v,c.__.__k[c.__i]=c,N(f,c,p),l.__=l.__e=null,c.__e!=u&&w(c)))}finally{(a=r.length)&&(i||queueMicrotask)(E)}}function ee(e,t,n,r,i,a,o,s,c,l,u){var d,m,h,g,_,v,y=r.__k||p,b=t.length;for(c=D(n,t,y,c,b),d=0;d<b;d++)(h=n.__k[d])!=null&&(m=~h.__i&&y[h.__i]||f,h.__i=d,v=M(e,h,m,i,a,o,s,c,l,u),g=h.__e,(m.ref!=h.ref||8&m.__u)&&(m.ref&&P(m.ref,null,h,m),h.ref&&u.push(h.ref,h.__c||g,h)),_||=g,4&h.__u?(c=O(h,c,e,!m.__v),m.__e&&(m.__e=null)):typeof h.type==`function`&&v!==void 0?c=v:g&&(c=g.nextSibling),h.__u&=-21);return n.__e=_,c}function D(e,t,n,r,i){var a,o,s,c,l,u,f,p,m,g=n.length,_=g,v=0,y=0,S=e.__k=Array(i);for(a=0;a<i;a++)(o=t[a])!=null&&typeof o!=`boolean`&&typeof o!=`function`?(typeof o!=`object`||o.constructor===String?o=S[a]=b(null,o):h(o)?o=S[a]=b(x,{children:o}):o.constructor===d&&o.__b?o=S[a]=b(o.type,o.props,o.key,o.ref,o.__v):S[a]=o,c=a+v,o.__=e,o.__b=e.__b+1,s=null,~(l=o.__i=k(o,n,c,_))&&(_--,(s=n[l])&&(s.__u|=2)),s&&s.__v?(o.__u|=16,l==c-1?v--:l==c+1?v++:l!=c&&(l>c?v--:v++,y=1)):(~l||(i>g?v--:i<g&&v++),typeof o.type!=`function`&&(o.__u|=4))):S[a]=null;if(y){for(u=[],f=[],a=0;a<i;a++)if((o=S[a])&&16&o.__u){for(v=0,p=u.length;v<p;)u[m=v+p>>1]<o.__i?v=m+1:p=m;u[v]=o.__i,f[a]=v+1}for(v=u.length;a--;)f[a]&&(f[a]==v?v--:S[a].__u|=4)}if(_)for(a=0;a<g;a++)!(s=n[a])||2&s.__u||(s.__e==r&&(r=C(s)),ae(s,s));return r}function O(e,t,n,r){var i,a,o,s;if(typeof e.type==`function`){if(e.props.__P)return t;if(i=e.__k)for(a=0;a<i.length;a++)i[a]&&(i[a].__=e,t=O(i[a],t,n,!1));return t}for(t&&!t.parentNode&&(t=C(e))&&!t.parentNode&&(t=null),o=e.__e,s=t;s&&s.nodeType==8;)s=s.nextSibling;for(o!=s&&(!r&&n.moveBefore&&o.parentNode?n.moveBefore(o,t):n.insertBefore(o,t||null)),t=o;(t&&=t.nextSibling)&&t.nodeType==8&&!t.data.startsWith(`$s`););return t}function k(e,t,n,r){var i,a=e.key,o=e.type,s=t[n],c=s&&!(2&s.__u);if(s===null&&a==null||c&&a==s.key&&o==s.type)return n;if(r>+!!c){for(i=n-1;i>=0;i--)if((s=t[i])&&!(2&s.__u)&&a==s.key&&o==s.type)return i;for(i=n+1;i<t.length;i++)if((s=t[i])&&!(2&s.__u)&&a==s.key&&o==s.type)return i}return-1}function A(e,t,n){n??=``,t[0]==`-`?e.setProperty(t,n):e[t]=n}function j(e,t,n,r,i){var a,o;if(t==`style`){if(typeof n==`string`)e.style.cssText=n;else{if(typeof r==`string`&&(e.style.cssText=r=``),r)for(t in r)n&&t in n||A(e.style,t);if(n)for(t in n)r&&n[t]==r[t]||A(e.style,t,n[t])}}else if(t[0]==`o`&&t[1]==`n`)(e.__e||={})[t]=n,n&&r||(o=u[t]||(u[t]=te(t)),(e.__a||={})[t]=l,a=t!=(t=t.replace(c,`$1`)),(t=t.slice(2))[0]<`a`&&(t=t.toLowerCase()),n?e.addEventListener(t,o,a):e.removeEventListener(t,o,a));else{if(i==`http://www.w3.org/2000/svg`)t=t.replace(/xlink(H|:h)/,`h`).replace(/sName$/,`s`);else if(t!=`width`&&t!=`height`&&t!=`href`&&t!=`list`&&t!=`form`&&t!=`tabIndex`&&t!=`download`&&t!=`rowSpan`&&t!=`colSpan`&&t!=`role`&&t!=`popover`&&t in e)try{e[t]=n??``;return}catch{}if(typeof n==`function`)return;n==null||!1===n&&t[4]!=`-`?e.removeAttribute(t):e.setAttribute(t,t==`popover`&&n==1?``:n)}}function te(t){return function(n){var r=this.__e;if(r){if(r=r[t],n[s]==null)n[s]=l++;else if(n[s]<this.__a[t])return;return r(e.event?e.event(n):n)}}}function M(t,n,r,i,a,o,s,c,l,u){var f,m,g,y,b,w,T,E,D,O,k,A,j,te,M,N,P,se,F=n.type;if(n.constructor!==d)return null;128&r.__u&&(l=32&r.__u,f=r.__c.__z)&&(n.__u|=l,m=o=[],f.nodeType==8?c=ne(f,o):o.push(f),c=o[0]||c),(f=e.__b)&&f(n);n:if(typeof F==`function`){g=s.length;try{if(E=n.props,D=(f=F.prototype)&&f.render,O=(f=F.contextType)&&i[f.__c],k=f?O?O.props.value:f.__:i,(y=r.__c)?(n.__c=y,2&y.__g&&(y.__g|=1)):(D?n.__c=y=new F(E,k):(n.__c=y=new S(E,k),y.constructor=F,y.render=oe),O&&O.sub(y),y.state||(y.state={}),y.__n=i,y.__g|=8,y.__h=[],y.__k=[]),D&&(y.__s||(y.__s=y.state),F.getDerivedStateFromProps&&(y.__s==y.state&&(y.__s=_({},y.__s)),_(y.__s,F.getDerivedStateFromProps(E,y.__s)))),b=y.props,w=y.state,y.__v=n,r.__c){if(E!==b&&D&&!F.getDerivedStateFromProps&&y.componentWillReceiveProps&&y.componentWillReceiveProps(E,k),n.__v==r.__v&&!(8&y.__g)||!(4&y.__g)&&y.shouldComponentUpdate&&!1===y.shouldComponentUpdate(E,y.__s,k)){n.__v!=r.__v&&(y.props=E,y.state=y.__s,y.__g&=-9),n.__e=r.__e,n.__k=r.__k,n.__k.some(function(e){e&&(e.__=n)}),p.push.apply(y.__h,y.__k),y.__k=[],y.__h.length&&s.push(y),c=C(r);break n}y.componentWillUpdate&&y.componentWillUpdate(E,y.__s,k),D&&y.componentDidUpdate&&y.__h.push(function(){y.componentDidUpdate(b,w,T)})}else D&&!F.getDerivedStateFromProps&&y.componentWillMount&&y.componentWillMount(),D&&y.componentDidMount&&y.__h.push(y.componentDidMount);if(y.context=k,y.props=E,y.__P=t,y.__g&=-5,A=e.__r,j=0,D)y.state=y.__s,y.__g&=-9,A&&A(n),f=y.render(y.props,y.state,y.context),p.push.apply(y.__h,y.__k),y.__k=[];else do y.__g&=-9,A&&A(n),f=y.render(y.props,y.state,y.context),y.state=y.__s;while(8&y.__g&&++j<25);y.state=y.__s,y.getChildContext&&(i=_({},i,y.getChildContext())),D&&r.__c&&y.getSnapshotBeforeUpdate&&(T=y.getSnapshotBeforeUpdate(b,w)),te=f&&f.type===x&&f.key==null?f.props.children:f,E.__P&&(f=c,a=(t=E.__P).namespaceURI,l=o=null,r.props&&r.props.__P!=t&&(r.__k.some(function(e){e&&ae(e,e)}),r.__k=null),c=r.__k?C(r,0):null),c=ee(t,h(te)?te:[te],n,r,i,a,o,s,c,l,u),E.__P&&(n.__e=null,c=f),n.__u&=-161,m&&m.some(v),y.__h.length&&s.push(y),1&y.__g&&(y.__g&=-4)}catch(t){if(s.length=g,n.__v=null,l||o){if(t.then){if(M=0,n.__u|=128|l,o){for(~(P=o.indexOf(c||void 0))||(P=o.length);(se=o[P-1])&&se.nodeType==8;)P--;for(;P<o.length;P++)if(se=o[P]){if(o[P]=null,se.nodeType==8){if(se.data.startsWith(`$s`))M++||(N=se);else if(M&&se.data.startsWith(`/$s`)&&!--M)break}else if(!M)break}}if(!N){for(;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;N=c}(f=ne(N=n.__c.__z||(n.__c.__z=N)))?(n.__e=N,c=f):n.__e=c,c&&=c.nextSibling}else o&&o.some(v)}else n.__e=r.__e;n.__k||=r.__k||[],t.then||re(n),e.__e(t,n,r)}}else c=n.__e=ie(r.__e,n,r,i,a,o,s,l,u,t);return(f=e.diffed)&&f(n),c}function ne(e,t){if(e&&e.nodeType==8&&e.data.startsWith(`$s`))for(var n=1;e=e.nextSibling;){if(e.nodeType==8){if(e.data.startsWith(`$s`))n++;else if(e.data.startsWith(`/$s`)&&!--n)return e}t&&t.push(e)}}function re(e){e&&(e.__c&&(e.__c.__g|=4),e.__k&&e.__k.some(re))}function N(t,n,r){for(var i=0;i<r.length;)P(r[i++],r[i++],r[i++]);e.__c&&e.__c(n,t),t.some(function(n){try{t=n.__h,n.__h=[],t.some(function(e){e.call(n)})}catch(t){e.__e(t,n.__v)}})}function ie(t,n,r,i,a,o,s,c,l,u){var d,p,_,y,b,x,S,w,T,E=r.props||f,D=n.props,O=n.type;if(O==`svg`?a=`http://www.w3.org/2000/svg`:O==`math`?a=`http://www.w3.org/1998/Math/MathML`:a||=`http://www.w3.org/1999/xhtml`,o){for(d=0;d<o.length;d++)if((b=o[d])&&(O?b.localName==O:b.nodeType==3)){t=b,o[d]=null;break}}if(!t){if(w=u.ownerDocument||document,!O)return w.createTextNode(D);t=w.createElementNS(a,O,D.is&&D),c&&=(e.__m&&e.__m(n,o),!1),o=null}if(O){if(u=O==`template`&&t.content||t,o=O==`textarea`&&D.defaultValue!=null?null:o&&g.call(u.childNodes),!c&&o)for(E={},d=0;d<t.attributes.length;d++)E[(b=t.attributes[d]).name]=b.value;for(d in E)b=E[d],d==`dangerouslySetInnerHTML`?_=b:d==`children`||d in D||d==`value`&&`defaultValue`in D||d==`checked`&&`defaultChecked`in D||j(t,d,null,b,a);for(d in T=1&r.__u,D)b=D[d],d==`children`?y=b:d==`dangerouslySetInnerHTML`?p=b:d==`value`?x=b:d==`checked`?S=b:c&&typeof b!=`function`||!(E[d]!==b||T&&b!=null)||j(t,d,b,E[d],a);p?(c||_&&(p.__html==_.__html||p.__html==t.innerHTML)||(t.innerHTML=p.__html),n.__k=[]):(_&&(t.textContent=``),(O==`foreignObject`||a==`http://www.w3.org/1998/Math/MathML`&&m.test(O))&&(a=`http://www.w3.org/1999/xhtml`),ee(u,h(y)?y:[y],n,r,i,a,o,s,o?o[0]:r.__k&&C(r,0),c,l),o&&o.some(v)),c&&O!=`textarea`||(d=`value`,O==`progress`&&x==null?t.removeAttribute(d):x==null||x===t[d]&&(O!=`progress`||x)||j(t,d,x,E[d],a),d=`checked`,S!=null&&S!=t[d]&&j(t,d,S,E[d],a))}else E===D||c&&t.data==D||(t.data=D);return t}function P(t,n,r,i){try{typeof t==`function`?n?n.__x=t(n)||1:(i&&=i.__c||i.__e)&&(n=i.__x)&&(i.__x=null,typeof n==`function`?n():t(null)):t.current=n}catch(t){e.__e(t,r)}}function ae(t,n,r){var i,a,o,s;if(e.unmount&&e.unmount(t),!(i=t.ref)||i.current&&i.current!=t.__e||P(i,null,n,t),i=t.__c){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(t){e.__e(t,n)}i.__P=i.__n=null}if(i=t.__k)for(s=0;s<i.length;s++)i[s]&&ae(i[s],n,typeof t.type!=`function`||r&&!t.props.__P);!r&&(i=t.__c)&&(i=i.__z)&&(a=ne(i,o=[]))&&(i==t.__e&&o.some(v),v(a),v(i)),(i=t.__e)&&(r||v(i),i.__e&&(i.__e=null)),t.__e=t.__c=t.__=null}function oe(e,t,n){return this.constructor(e,n)}function se(t,n){var r,i,a,o;e.__&&e.__(t,n),n.nodeType==9&&(n=n.documentElement),i=(r=t&&32&t.__u)?null:n.__k,n.__k=b(x,{children:[t]}),a=[],o=[],M(n,n.__k,i||f,f,n.namespaceURI,i?null:n.firstChild?g.call(n.childNodes):null,a,i?i.__e:n.firstChild,r,o),N(a,n.__k,o),n.__k.props.children=null}e={__e:function(e,t,n,r){for(var i,o,s;t=t.__;)if((i=t.__c)&&!(1&i.__g)){i.__g|=4;try{if((s=(o=i.constructor)&&o.getDerivedStateFromError)&&i.setState(o.getDerivedStateFromError(e)),i.componentDidCatch&&(i.componentDidCatch(e,r||{}),s=1),s&&8&i.__g)return void(i.__g|=2)}catch(t){e=t}}throw a=0,e}},t=0,n=function(e){return e!=null&&e.constructor===d},S.prototype.setState=function(e,t){var n=this.__s;n&&n!=this.state||(n=this.__s=_({},this.state)),typeof e==`function`&&(e=e(_({},n),this.props)),e&&(_(n,e),this.__v&&(t&&this.__k.push(t),T(this)))},S.prototype.forceUpdate=function(e){this.__v&&(this.__g|=4,e&&this.__h.push(e),T(this))},S.prototype.render=x,r=[],a=0,o=function(e,t){return e.__v.__b-t.__v.__b},s=Symbol(),c=/(PointerCapture)$|Capture$/i,l=0,u={};var F,I,ce,le,ue=Object.is,de=0,fe=[],pe=[],L=e,me=L.__b,he=L.__r,ge=L.diffed,_e=L.__c,ve=L.unmount,ye=L.__;function be(e,t){L.__h&&L.__h(I,e,de||t),de=0;var n=I.__H||(I.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function xe(e){return de=1,Se(Ne,e)}function Se(e,t,n){var r=be(F++,2);if(r.t=e,!r.__c&&(r.__=[n?n(t):Ne(void 0,t),function(e){var t=r.__N?r.__N[0]:r.__[0],n=r.t(t,e);ue(t,n)||(r.__N=[n,r.__[1]],r.__c.setState({}))}],r.__c=I,!I.__f)){I.__f=!0;var i=I.shouldComponentUpdate;I.shouldComponentUpdate=function(e,t,n){var r=this.__H;if(!r)return!0;var a=!1,o=this.props!=e;if(r.__.some(function(e){e.__N&&(a=!0,ue(e.__[0],e.__N[0])||(o=!0))}),i){var s=i.call(this,e,t,n);return a?s||o:s}return!a||o}}return r.__}function Ce(e,t){var n=be(F++,3);!L.__s&&Me(n.__H,t)&&(n.__P=!0,n.__=e,n.u=t,I.__H.__h.push(n))}function we(e){return de=5,Te(function(){return{current:e}},[])}function Te(e,t){var n=be(F++,7);return Me(n.__H,t)&&(n.__=e(),n.__H=t),n.__}function Ee(){var e;do{for(;e=pe.shift();)try{Ae(e)}catch(t){L.__e(t,{__:(e=e.__P)&&e.__v})}for(;e=fe.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(Ae),t.__h.some(je),t.__h=[]}catch(n){t.__h=[],L.__e(n,e.__v)}}}while(pe.length)}L.__b=function(e){I=null,me&&me(e)},L.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),ye&&ye(e,t)},L.__r=function(e){he&&he(e),F=0;var t=(I=e.__c).__H;t&&(ce==I?I.__h=[]:(t.__h.some(Ae),t.__h.some(je),F=0),t.__h=[],t.__.some(function(e){e.__N&&(e.__=e.__N),e.u=e.__N=void 0})),ce=I},L.diffed=function(e){ge&&ge(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&ke(fe.push(t)),t.__H.__.some(function(e){e.u&&(e.__H=e.u)})),ce=I=null},L.__c=function(e,t){t.some(function(e){try{e.__h.some(Ae),e.__h=e.__h.filter(function(e){return!e.__||je(e)})}catch(t){e.__h=[function(){throw t}]}}),_e&&_e(e,t)},L.unmount=function(e){ve&&ve(e);var t,n,r=e.__c;r&&r.__H&&(r.__H.__.some(function(r){try{if(r.__P&&r.__c){if(n===void 0){for(n=e.__;n&&(!n.__c||!n.__c.__P);)n=n.__;n&&=n.__c}r.__P=n,ke(pe.push(r))}else Ae(r)}catch(e){t=e}}),r.__H=void 0,t&&L.__e(t,r.__v))};var De=typeof requestAnimationFrame==`function`;function Oe(e){var t,n=function(){clearTimeout(r),De&&cancelAnimationFrame(t),setTimeout(e)},r=setTimeout(n,35);De&&(t=requestAnimationFrame(n))}function ke(e){e!=1&&le==L.requestAnimationFrame||((le=L.requestAnimationFrame)||Oe)(Ee)}function Ae(e){var t=I,n=e.__c;typeof n==`function`&&(e.__c=void 0,n()),I=t}function je(e){var t=I;e.__c=e.__(),I=t}function Me(e,t){return!e||e.length!=t.length||t.some(function(t,n){return!ue(t,e[n])})}function Ne(e,t){return typeof t==`function`?t(e):t}var Pe=Symbol.for(`preact-signals`);function Fe(){if(Be>1)Be--;else{var e,t=!1;for((function(){var e=We;for(We=void 0;e!==void 0;){var t=e.S;if(t.v===e.v)for(var n=t.t;n!==void 0;n=n.x)n.i===e.i&&(n.i=t.i);e=e.o}})();ze!==void 0;){var n=ze;for(ze=void 0,Ve++;n!==void 0;){var r=n.u;if(n.u=void 0,n.f&=-3,!(8&n.f)&&qe(n))try{n.c()}catch(n){t||=(e=n,!0)}n=r}}if(Ve=0,Be--,t)throw e}}function Ie(e){if(Be>0)return e();Ue=++He,Be++;try{return e()}finally{Fe()}}var Le,R=void 0;function Re(e){var t=R,n=Le;R=void 0,Le=void 0;try{return e()}finally{R=t,Le=n}}var ze=void 0,Be=0,Ve=0,He=0,Ue=0,We=void 0,Ge=0;function Ke(e){if(R!==void 0){var t=e.n;if(t===void 0||t.t!==R)return t={i:0,S:e,p:R.s,n:void 0,t:R,e:void 0,x:void 0,r:t},R.s!==void 0&&(R.s.n=t),R.s=t,e.n=t,32&R.f&&e.S(t),t;if(t.i===-1)return t.i=0,t.n!==void 0&&(t.n.p=t.p,t.p!==void 0&&(t.p.n=t.n),t.p=R.s,t.n=void 0,R.s.n=t,R.s=t),t}}function z(e,t){this.v=e,this.i=0,this.n=void 0,this.t=void 0,this.l=0,this.W=t?.watched,this.Z=t?.unwatched,this.name=t?.name}z.prototype.brand=Pe,z.prototype.h=function(){return!0},z.prototype.S=function(e){var t=this,n=this.t;n!==e&&e.e===void 0&&(e.x=n,this.t=e,n===void 0?Re(function(){var e;(e=t.W)==null||e.call(t)}):n.e=e)},z.prototype.U=function(e){var t=this;if(this.t!==void 0){var n=e.e,r=e.x;n!==void 0&&(n.x=r,e.e=void 0),r!==void 0&&(r.e=n,e.x=void 0),e===this.t&&(this.t=r,r===void 0&&Re(function(){var e;(e=t.Z)==null||e.call(t)}))}},z.prototype.subscribe=function(e){var t=this;return nt(function(){var n=t.value;Re(function(){return e(n)})},{name:`sub`})},z.prototype.valueOf=function(){return this.value},z.prototype.toString=function(){return this.value+``},z.prototype.toJSON=function(){return this.value},z.prototype.peek=function(){var e=this;return Re(function(){return e.value})},Object.defineProperty(z.prototype,"value",{get:function(){var e=Ke(this);return e!==void 0&&(e.i=this.i),this.v},set:function(e){if(e!==this.v){if(Ve>100)throw Error(`Cycle detected`);(function(e){Be!==0&&Ve===0&&e.l!==Ue&&(e.l=Ue,We={S:e,v:e.v,i:e.i,o:We})})(this),this.v=e,this.i++,Ge++,Be++;try{for(var t=this.t;t!==void 0;t=t.x)t.t.N()}finally{Fe()}}}});function B(e,t){return new z(e,t)}function qe(e){for(var t=e.s;t!==void 0;t=t.n)if(t.S.i!==t.i||!t.S.h()||t.S.i!==t.i)return!0;return!1}function Je(e){for(var t=e.s;t!==void 0;t=t.n){var n=t.S.n;if(n!==void 0&&(t.r=n),t.S.n=t,t.i=-1,t.n===void 0){e.s=t;break}}}function Ye(e){for(var t=e.s,n=void 0;t!==void 0;){var r=t.p;t.i===-1?(t.S.U(t),r!==void 0&&(r.n=t.n),t.n!==void 0&&(t.n.p=r)):n=t,t.S.n=t.r,t.r!==void 0&&(t.r=void 0),t=r}e.s=n}function Xe(e,t){z.call(this,void 0,t),this.x=e,this.s=void 0,this.g=Ge-1,this.f=4}Xe.prototype=new z,Xe.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if((36&this.f)==32||(this.f&=-5,this.g===Ge))return!0;if(this.g=Ge,this.f|=1,this.i>0&&!qe(this))return this.f&=-2,!0;var e=R;try{Je(this),R=this;var t=this.x();(16&this.f||this.v!==t||this.i===0)&&(this.v=t,this.f&=-17,this.i++)}catch(e){this.v=e,this.f|=16,this.i++}return R=e,Ye(this),this.f&=-2,!0},Xe.prototype.S=function(e){if(this.t===void 0){this.f|=36;for(var t=this.s;t!==void 0;t=t.n)t.S.S(t)}z.prototype.S.call(this,e)},Xe.prototype.U=function(e){if(this.t!==void 0&&(z.prototype.U.call(this,e),this.t===void 0)){this.f&=-33;for(var t=this.s;t!==void 0;t=t.n)t.S.U(t)}},Xe.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var e=this.t;e!==void 0;e=e.x)e.t.N()}},Object.defineProperty(Xe.prototype,"value",{get:function(){if(1&this.f)throw Error(`Cycle detected`);var e=Ke(this);if(this.h(),e!==void 0&&(e.i=this.i),16&this.f)throw this.v;return this.v}});function Ze(e,t){return new Xe(e,t)}function Qe(e){var t=e.j;if(e.j=void 0,typeof t==`function`){Be++;var n=R;R=void 0;try{t()}catch(t){throw e.f&=-2,e.f|=8,$e(e),t}finally{R=n,Fe()}}}function $e(e){for(var t=e.s;t!==void 0;t=t.n)t.S.U(t);e.x=void 0,e.s=void 0,Qe(e)}function et(e){if(R!==this)throw Error(`Out-of-order effect`);Ye(this),R=e,this.f&=-2;try{8&this.f&&$e(this)}finally{Fe()}}function tt(e,t){this.x=e,this.j=void 0,this.s=void 0,this.u=void 0,this.f=32,this.name=t?.name,Le&&Le.push(this)}tt.prototype.c=function(){var e=this.S();try{if(8&this.f||this.x===void 0)return;var t=this.x();typeof t==`function`&&(this.j=t)}finally{e()}},tt.prototype.S=function(){if(1&this.f)throw Error(`Cycle detected`);this.f|=1,this.f&=-9,Qe(this),Je(this),Be++;var e=R;return R=this,et.bind(this,e)},tt.prototype.N=function(){2&this.f||(this.f|=2,this.u=ze,ze=this)},tt.prototype.d=function(){this.f|=8,1&this.f||$e(this)},tt.prototype.dispose=function(){this.d()};function nt(e,t){var n=new tt(e,t);try{n.c()}catch(e){throw n.d(),e}var r=n.d.bind(n);return r[Symbol.dispose]=r,r}var rt,it,at=typeof window<`u`&&!!window.__PREACT_SIGNALS_DEVTOOLS__,ot=[];nt(function(){rt=this.N})();function st(t,n){e[t]=n.bind(null,e[t]||function(){})}function ct(e){if(it){var t=it;it=void 0,t()}it=e&&e.S()}function lt(e){var t=this,r=e.data,i=dt(r);i.name=`ReactiveDom`,i.value=r;var a=Te(function(){for(var e=t,r=t.__v;r=r.__;)if(r.__c){r.__c.__$f|=4;break}var a=Ze(function(){var e=i.value.value;return e===0?0:!0===e?``:e||``}),o=Ze(function(){return!Array.isArray(a.value)&&!n(a.value)}),s=nt(function(){if(this.N=mt,o.value){var t=a.value;e.__v&&e.__v.__e&&e.__v.__e.nodeType===3&&(e.__v.__e.data=t)}}),c=t.__$u.d;return t.__$u.d=function(){s(),c.call(this)},[o,a]},[]),o=a[0],s=a[1];return o.value?s.peek():s.value}lt.displayName=`ReactiveTextNode`,Object.defineProperties(z.prototype,{constructor:{configurable:!0,value:y(x,null).constructor},type:{configurable:!0,value:lt},props:{configurable:!0,get:function(){var e=this;return{data:{get value(){return e.value}}}}},__b:{configurable:!0,value:1}}),st(`__b`,function(e,t){if(ct(),typeof t.type==`string`){var n,r=t.props;for(var i in r)if(i!==`children`){var a=r[i];a instanceof z&&(n||(t.__np=n={}),n[i]=a,r[i]=a.peek())}}e(t)}),st(`__r`,function(e,t){if(e(t),t.type!==x){ct();var n,r=t.__c;r&&(r.__$f&=-2,(n=r.__$u)===void 0&&(r.__$u=n=function(e,t){var n;return nt(function(){n=this},{name:t}),n.c=e,n}(function(e){return function(){var t;at&&((t=this.y)==null||t.call(this)),e.__$f|=1,e.setState({})}}(r),typeof t.type==`function`?t.type.displayName||t.type.name:``))),ct(n)}}),st(`__e`,function(e,t,n,r){ct(),e(t,n,r)}),st(`diffed`,function(e,t){ct();var n;if(typeof t.type==`string`&&(n=t.__e)){var r=t.__np,i=t.props,a=n.U;if(a)for(var o in a){var s=a[o];s===void 0||r&&o in r||(s.d(),a[o]=void 0)}if(r)for(var c in a||(a={},n.U=a),r){var l=a[c],u=r[c];l===void 0?(l=ut(n,c,u,i),a[c]=l):l.o(u,i)}}e(t)});function ut(e,t,n,r){var i=t in e&&e.ownerSVGElement===void 0,a=B(n);return{o:function(e,t){a.value=e,r=t},d:nt(function(){this.N=mt;var n=a.value.value;r[t]!==n&&(r[t]=n,i?e[t]=n:n!=null&&(!1!==n||t[4]===`-`)?e.setAttribute(t,n):e.removeAttribute(t))})}}st(`unmount`,function(e,t){if(typeof t.type==`string`){var n=t.__e;if(n){var r=n.U;if(r)for(var i in n.U=void 0,r){var a=r[i];a&&a.d()}}var o=t.__np;if(o){var s=t.props;for(var c in o)s[c]=o[c]}t.__np=void 0}else{var l=t.__c;if(l){l.__$f|=8;var u=l.__$u;u&&(l.__$u=void 0,u.d())}}e(t)}),st(`__h`,function(e,t,n,r){r<3&&(t.__$f|=2),e(t,n,r)}),S.prototype.shouldComponentUpdate=function(e,t){if(this.__R)return!0;var n=this.__$u,r=n&&n.s!==void 0;for(var i in t)return!0;if(this.__f||typeof this.u==`boolean`&&!0===this.u){var a=2&this.__$f;if(!(r||a||4&this.__$f)||1&this.__$f)return!0}else if(!(r||4&this.__$f)||3&this.__$f)return!0;for(var o in e)if(o!==`__source`&&e[o]!==this.props[o])return!0;for(var s in this.props)if(!(s in e))return!0;return!1};function dt(e,t){return Te(function(){return B(e,t)},[])}var ft=function(e){queueMicrotask(function(){queueMicrotask(e)})};function pt(){Ie(function(){for(var e;e=ot.shift();)rt.call(e)})}function mt(){ot.push(this)===1&&(e.requestAnimationFrame||ft)(pt)}var ht=[15,15];function gt(e){let t=1;for(let n of e)t*=n;return t}function V(e,t,n,r=0){return t+e[0]*(n+e[1]*r)}function _t(e,t,n){let r=e[0],i=e[1],a=Math.floor(t/r);return n[0]=t-a*r,n[1]=a%i,n[2]=Math.floor(a/i),n}function vt(e,t,n,r=0){return t>=0&&n>=0&&r>=0&&t<e[0]&&n<e[1]&&r<(e[2]??1)}function yt(e,t){if(e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0}var H=function(e){return e[e.Air=0]=`Air`,e[e.Wall=1]=`Wall`,e[e.Fan=2]=`Fan`,e[e.Heater=3]=`Heater`,e[e.Window=4]=`Window`,e}({}),bt=[`N`,`NE`,`E`,`SE`,`S`,`SW`,`W`,`NW`],xt=[[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]],St=[1,5],Ct=[1,5],wt=[20,100],Tt=[1,5],Et={dir:2,on:!0,level:3,oscillate:!1,sweepSpeed:2},Dt={on:!0,targetC:50,outputRate:3},Ot={open:!1};function kt(e,[t,n]){return Number.isFinite(e)?Math.min(n,Math.max(t,Math.round(e))):t}function At(e){let t={};return e.dir!==void 0&&(t.dir=(Math.round(e.dir)%8+8)%8),e.on!==void 0&&(t.on=!!e.on),e.level!==void 0&&(t.level=kt(e.level,St)),e.oscillate!==void 0&&(t.oscillate=!!e.oscillate),e.sweepSpeed!==void 0&&(t.sweepSpeed=kt(e.sweepSpeed,Ct)),t}function jt(e){let t={};return e.on!==void 0&&(t.on=!!e.on),e.targetC!==void 0&&(t.targetC=kt(e.targetC,wt)),e.outputRate!==void 0&&(t.outputRate=kt(e.outputRate,Tt)),t}function Mt(e){let t={};return e.open!==void 0&&(t.open=!!e.open),t}function Nt(e,t){return(e+(t?2:6))%8}var Pt=48;function Ft(){return{x:0,y:0,scale:10,fitted:!0}}function It(e,t,n){let r=Math.min((t-32)/e[0],(n-32)/e[1]);return Math.min(64,Math.max(.5,r))}function Lt(e,t,n,r){let i=It(t,n,r);e.scale=i,e.x=(n-t[0]*i)/2,e.y=(r-t[1]*i)/2,e.fitted=!0}function Rt(e,t,n,r){let i=t[0]*e.scale,a=t[1]*e.scale,o=Math.min(Pt,i),s=Math.min(Pt,a);e.x=Math.min(n-o,Math.max(o-i,e.x)),e.y=Math.min(r-s,Math.max(s-a,e.y))}function zt(e,t,n,r,i,a,o){let s=Math.min(64,Math.max(It(t,n,r),e.scale*o)),c=s/e.scale;e.x=i-(i-e.x)*c,e.y=a-(a-e.y)*c,e.scale=s,e.fitted=!1,Rt(e,t,n,r)}function Bt(e,t,n,r,i,a){e.x+=i,e.y+=a,e.fitted=!1,Rt(e,t,n,r)}function Vt(e,t,n,r){return r[0]=(t-e.x)/e.scale,r[1]=(n-e.y)/e.scale,r}function Ht(e,t,n,r,i){let a=Math.abs(n-e),o=-Math.abs(r-t),s=e<n?1:-1,c=t<r?1:-1,l=a+o,u=e,d=t;for(;;){if(i(u,d),u===n&&d===r)return;let e=2*l;e>=o&&(l+=o,u+=s),e<=a&&(l+=a,d+=c)}}function Ut(e){let t=e.target;return t instanceof HTMLTextAreaElement||t instanceof HTMLSelectElement?!0:t instanceof HTMLInputElement?t.type===`checkbox`||t.type===`button`?!1:t.type!==`range`||e.key.startsWith(`Arrow`)||e.key===`Home`||e.key===`End`:!1}var Wt=50,Gt=4;function Kt(e,t){let n=[0,0],r=`none`,i=0,a=0,o=0,s=H.Air,c=0,l=0,u=0,d=0,f=0,p=!1,m=0,h=0,g=!1,_=!1,v=t=>{let n=e.getBoundingClientRect();return[t.clientX-n.left,t.clientY-n.top]},y=(e,r)=>(Vt(t.view,e,r,n),[Math.floor(n[0]),Math.floor(n[1])]),b=(e,n)=>t.paint(e,n,s),x=(e,t)=>Math.min(t-1,Math.max(0,e)),S=e=>e.altKey||e.ctrlKey||e.metaKey?`subtract`:e.shiftKey?`add`:`replace`,C=()=>{t.gesture.kind=`none`,t.requestRender()},w=()=>{r===`move`&&t.endMove(!1),(r===`marquee`||r===`move`)&&(r=`none`,C(),T())},T=()=>{let n=t.tool();e.style.cursor=r===`pan`?`grabbing`:g?`grab`:r===`move`?`move`:n===`brush`||n===`select`?`crosshair`:`default`},E=n=>{if(r!==`none`)return;n.preventDefault();let[i,x]=v(n);if(c=n.button,n.button===1||n.button===0&&g)g&&(_=!0),r=`pan`,m=i,h=x;else if(t.isPasting()){n.button===0?t.placePaste():n.button===2&&t.cancelPaste();return}else if(t.tool()===`select`){if(n.button!==0)return;let[e,a]=y(i,x),o=!n.shiftKey&&!n.altKey&&!n.ctrlKey&&!n.metaKey;if(!vt(t.shape(),e,a)){o&&t.clearSelection();return}if(l=e,u=a,o&&t.inSelection(e,a)&&t.beginMove())r=`move`;else{r=`marquee`;let i=t.gesture;i.kind=`marquee`,i.x0=i.x1=e,i.y0=i.y1=a,i.mode=S(n),t.requestRender()}}else if(t.tool()===`pointer`){if(n.button!==0)return;r=`press`,a=m=i,o=h=x;let[e,t]=y(i,x);l=e,u=t}else if(n.button===0||n.button===2){let[e,a]=y(i,x);if(!vt(t.shape(),e,a))return;r=`paint`,t.beginStroke(),s=n.button===2?H.Air:t.activeType(),l=d=e,u=f=a,p=!1,b(e,a)}else return;e.setPointerCapture(n.pointerId),T()},ee=n=>{let[i,s]=v(n);if(r===`press`&&Math.hypot(i-a,s-o)>Gt&&(r=`pan`,T()),r===`pan`){Bt(t.view,t.shape(),e.clientWidth,e.clientHeight,i-m,s-h),m=i,h=s,t.requestRender();return}let[c,g]=y(i,s);if(r===`marquee`){let e=t.gesture;e.x1=x(c,t.shape()[0]),e.y1=x(g,t.shape()[1]),t.requestRender()}else r===`move`&&t.moveBy(c-l,g-u);r===`paint`&&(c!==d||g!==f)&&((c!==l||g!==u)&&(p=!0),Ht(d,f,c,g,b),d=c,f=g),vt(t.shape(),c,g)?t.hover(c,g):t.hover(-1,-1)},D=n=>{if(r!==`none`){if(r===`marquee`){let e=t.gesture;t.commitMarquee(e.x0,e.y0,e.x1,e.y1,e.mode),C()}else if(r===`move`){let[e,r]=y(...v(n));e===l&&r===u?(t.endMove(!1),t.commitMarquee(l,u,l,u,`replace`)):t.endMove(!0)}r===`paint`&&t.endStroke(),r===`paint`&&!p&&c===0&&t.select(l,u),r===`press`&&(vt(t.shape(),l,u)?t.select(l,u):t.select(-1,-1)),r=`none`,e.hasPointerCapture(n.pointerId)&&e.releasePointerCapture(n.pointerId),T()}},O=()=>{r===`none`&&t.hover(-1,-1)},k=n=>{n.preventDefault();let[r,a]=v(n),o=n.deltaMode===1?16:n.deltaMode===2?400:1,s=e.clientWidth,c=e.clientHeight;if(n.ctrlKey&&t.hasObjectTarget()){let e=(n.deltaY||n.deltaX)*o;for(Math.sign(e)!==Math.sign(i)&&(i=0),i+=e;Math.abs(i)>=Wt;)t.adjust(n.shiftKey,i<0?1:-1),i-=Math.sign(i)*Wt;return}let l=n.ctrlKey?.01:.0015;zt(t.view,t.shape(),s,c,r,a,Math.exp(-(n.deltaY||n.deltaX)*o*l)),t.requestRender()},A=n=>{let r=e.clientWidth,i=e.clientHeight;zt(t.view,t.shape(),r,i,r/2,i/2,n),t.requestRender()},j=(n,r)=>{Bt(t.view,t.shape(),e.clientWidth,e.clientHeight,n,r),t.requestRender()},te=e=>{if(Ut(e))return;if(e.ctrlKey||e.metaKey){let n=e.key.toLowerCase();n===`z`?(e.preventDefault(),e.shiftKey?t.redo():t.undo()):n===`y`?(e.preventDefault(),t.redo()):n===`c`&&t.hasSelection()?(e.preventDefault(),t.copy()):n===`x`&&t.hasSelection()?(e.preventDefault(),t.cut()):n===`v`&&(e.preventDefault(),t.paste());return}if(e.code===`Space`){e.preventDefault(),g||(g=!0,_=!1,T());return}if(e.ctrlKey||e.metaKey||e.altKey)return;let n=e.key.toLowerCase(),i=e.code===`BracketLeft`?-1:+(e.code===`BracketRight`);if(n===`escape`&&(r===`marquee`||r===`move`))w();else if(n===`escape`&&t.isPasting())t.cancelPaste();else if(n===`escape`&&t.tool()===`select`&&t.hasSelection())t.clearSelection();else if(n===`escape`&&t.tool()===`pointer`)t.select(-1,-1);else if(n===`escape`||n===`v`)t.setTool(`pointer`);else if(i!==0)e.preventDefault(),t.adjust(e.shiftKey,i);else if(n===`e`||n===`q`)t.rotate(n===`e`);else if(n===`o`)t.toggleObject();else if(n===`s`)t.setTool(t.tool()===`select`?`pointer`:`select`);else if(n===`b`)t.setTool(t.tool()===`brush`?`pointer`:`brush`);else if(n>=`1`&&n<=`5`){let e=Number(n)-1;t.tool()===`brush`&&t.activeType()===e?t.setTool(`pointer`):t.setActiveType(e)}else n===`.`?t.step():n===`0`||n===`home`?(e.preventDefault(),t.fit()):n===`arrowleft`?(e.preventDefault(),j(80,0)):n===`arrowright`?(e.preventDefault(),j(-80,0)):n===`arrowup`?(e.preventDefault(),j(0,80)):n===`arrowdown`?(e.preventDefault(),j(0,-80)):n===`=`||n===`+`?A(1.25):(n===`-`||n===`_`)&&A(.8)},M=e=>{e.code===`Space`&&(g&&!_&&r!==`pan`&&t.togglePlay(),g=!1,T())},ne=()=>{g=!1,T()},re=e=>e.preventDefault(),N=e=>{e.button===1&&e.preventDefault()};return e.addEventListener(`pointerdown`,E),e.addEventListener(`pointermove`,ee),e.addEventListener(`pointerup`,D),e.addEventListener(`pointercancel`,D),e.addEventListener(`pointerleave`,O),e.addEventListener(`wheel`,k,{passive:!1}),e.addEventListener(`contextmenu`,re),e.addEventListener(`mousedown`,N),e.addEventListener(`auxclick`,N),window.addEventListener(`keydown`,te),window.addEventListener(`keyup`,M),window.addEventListener(`blur`,ne),T(),()=>{e.removeEventListener(`pointerdown`,E),e.removeEventListener(`pointermove`,ee),e.removeEventListener(`pointerup`,D),e.removeEventListener(`pointercancel`,D),e.removeEventListener(`pointerleave`,O),e.removeEventListener(`wheel`,k),e.removeEventListener(`contextmenu`,re),e.removeEventListener(`mousedown`,N),e.removeEventListener(`auxclick`,N),window.removeEventListener(`keydown`,te),window.removeEventListener(`keyup`,M),window.removeEventListener(`blur`,ne)}}function qt(e){let t=e.getContext(`webgl2`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!1});return t?t.getExtension(`EXT_color_buffer_float`)?{ok:!0,gl:t}:{ok:!1,reason:`Float render targets (EXT_color_buffer_float) are not supported.`}:{ok:!1,reason:`WebGL2 is not available.`}}function Jt(e,t){let n=e.canvas,r=Math.max(1,Math.round(n.clientWidth*t)),i=Math.max(1,Math.round(n.clientHeight*t));(n.width!==r||n.height!==i)&&(n.width=r,n.height=i),e.viewport(0,0,r,i)}function Yt(e,t,n){let r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r);throw e.deleteShader(r),Error(`Shader compile failed: ${t}`)}return r}function Xt(e,t,n){let r=e.createProgram(),i=Yt(e,e.VERTEX_SHADER,t),a=Yt(e,e.FRAGMENT_SHADER,n);if(e.attachShader(r,i),e.attachShader(r,a),e.linkProgram(r),e.deleteShader(i),e.deleteShader(a),!e.getProgramParameter(r,e.LINK_STATUS))throw Error(`Program link failed: ${e.getProgramInfoLog(r)}`);return r}function Zt(e,t){return e.replace(/^\/\/ #include (\w+)$/gm,(e,n)=>{let r=t[n];if(r===void 0)throw Error(`Unknown shader include: ${n}`);return r})}function Qt(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<r;i++){let r=e.getActiveUniform(t,i).name;n[r]=e.getUniformLocation(t,r)}return n}function $t(e,t,n,r=null){let i=e.createTexture();e.bindTexture(e.TEXTURE_2D,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA32F,t,n,0,e.RGBA,e.FLOAT,r);let a=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,a),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,i,0);let o=e.checkFramebufferStatus(e.FRAMEBUFFER);if(e.bindFramebuffer(e.FRAMEBUFFER,null),o!==e.FRAMEBUFFER_COMPLETE)throw Error(`Float render target incomplete (0x${o.toString(16)}).`);return{tex:i,fbo:a,w:t,h:n}}function en(e,t){e.deleteTexture(t.tex),e.deleteFramebuffer(t.fbo)}var tn=`// Velocity and tile lookups for passes that move through the air. Pasted in place of
// \`// #include field\`. Positions are in tile coordinates (y down).
uniform sampler2D uVel;     // RG32F, sim resolution, tiles/s
uniform usampler2D uTiles;  // RGBA8UI tile data (tileTexture.ts)
uniform ivec2 uSim;         // sim grid size, cells
uniform int uQuality;       // sim cells per tile edge
uniform ivec2 uGrid;        // tile grid size

vec2 velTap(ivec2 c) { return texelFetch(uVel, clamp(c, ivec2(0), uSim - 1), 0).xy; }

/** Bilinear air velocity at tile coords \`p\` (float textures may not filter). */
vec2 velAt(vec2 p) {
  vec2 s = p * float(uQuality) - 0.5;
  vec2 b = floor(s);
  vec2 f = s - b;
  ivec2 i0 = ivec2(b);
  vec2 a = mix(velTap(i0), velTap(i0 + ivec2(1, 0)), f.x);
  vec2 d = mix(velTap(i0 + ivec2(0, 1)), velTap(i0 + ivec2(1, 1)), f.x);
  return mix(a, d, f.y);
}

bool insideGrid(vec2 p) { return p.x >= 0.0 && p.y >= 0.0 && p.x < float(uGrid.x) && p.y < float(uGrid.y); }

/** Walls and closed windows. */
bool blockedAt(vec2 p) {
  uvec4 d = texelFetch(uTiles, ivec2(floor(p)), 0);
  return d.r == 1u || (d.r == 4u && d.g == 0u);
}

bool openAir(vec2 p) { return insideGrid(p) && !blockedAt(p); }
`,nn=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`,rn=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp usampler2D;
// #include random
// #include field
// #include polyline

// Particle state: one polyline per particle, point 0 = now, point k = k updates ago.
// Texel = (x, y, age in sim seconds, respawn count). Age < 0 = hidden (no open spot found).
uniform sampler2D uState;
uniform int uLen;      // trail points per particle
uniform int uPerRow;
uniform float uDt;     // sim seconds since the last update

out vec4 outValue;

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  int k = c.x % uLen;
  if (k > 0) {
    // Trail: shift one point back.
    outValue = texelFetch(uState, c - ivec2(1, 0), 0);
    return;
  }
  vec4 s = texelFetch(uState, c, 0);
  uint id = uint(c.y * uPerRow + c.x / uLen);
  vec2 p = s.xy;
  float age = s.z;
  float seed = s.w;
  if (age >= 0.0 && age < particleLife(id, seed) && openAir(p)) {
    // Midpoint (RK2) step along the air.
    vec2 mid = p + 0.5 * uDt * velAt(p);
    p += uDt * velAt(mid);
    age += uDt;
    if (openAir(p)) {
      outValue = vec4(p, age, seed);
      return;
    }
  }
  // Respawn somewhere random. If that spot is solid, stay hidden and retry next update.
  seed += 1.0;
  uint n = uint(seed) * 2u;
  p = vec2(rand01(id, n), rand01(id, n + 1u)) * vec2(uGrid);
  outValue = vec4(p, openAir(p) ? 0.0 : -1.0, seed);
}
`,an=`// Polyline storage shared by particles and streamlines. Pasted in place of \`// #include polyline\`.
// Point k of line i lives at texel ((i % perRow) * len + k, i / perRow).
ivec2 pointTexel(int line, int k, int len, int perRow) {
  return ivec2((line % perRow) * len + k, line / perRow);
}
`,on=`#version 300 es
precision highp float;

uniform vec4 uColor;  // straight alpha
in float vAlpha;
out vec4 outColor;

void main() {
  float a = uColor.a * vAlpha;
  outColor = vec4(uColor.rgb * a, a);  // premultiplied
}
`,sn=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include random
// #include polyline

// Draws polylines stored in a float texture (see polyline.glsl) without vertex buffers.
//   uKind 0: particle trails, 6 vertices per segment, fading toward the tail.
//   uKind 1: streamlines, 6 vertices per segment, fading with low speed and at the ends.
//   uKind 2: particle heads, one point per particle.
uniform sampler2D uState;
uniform int uKind;
uniform int uLen;
uniform int uPerRow;
uniform vec2 uRes;       // drawing buffer, device px
uniform vec2 uOrigin;    // grid top-left, device px (y down)
uniform float uScale;    // device px per tile
uniform float uWidth;    // line width, device px
uniform float uFullSpeed; // streamlines: air speed (tiles/s) drawn at full strength

out float vAlpha;

vec4 point(int line, int k) { return texelFetch(uState, pointTexel(line, k, uLen, uPerRow), 0); }
vec2 screen(vec2 p) { return uOrigin + p * uScale; }
vec4 clip(vec2 px) { return vec4(px.x / uRes.x * 2.0 - 1.0, 1.0 - px.y / uRes.y * 2.0, 0.0, 1.0); }

/** Particle fade in after spawning and out before dying. */
float lifeFade(int line, vec4 s) {
  float life = particleLife(uint(line), s.w);
  return smoothstep(0.0, 0.3, s.z) * (1.0 - smoothstep(life - 0.5, life, s.z));
}

void hide() {
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  gl_PointSize = 0.0;
  vAlpha = 0.0;
}

void main() {
  if (uKind == 2) {
    vec4 s = point(gl_VertexID, 0);
    if (s.z < 0.0) { hide(); return; }
    gl_Position = clip(screen(s.xy));
    gl_PointSize = uWidth * 2.0;
    vAlpha = lifeFade(gl_VertexID, s);
    return;
  }

  int segs = uLen - 1;
  int seg = gl_VertexID / 6;
  int corner = gl_VertexID % 6;
  int line = seg / segs;
  int k = seg % segs;
  vec4 a = point(line, k);
  vec4 b = point(line, k + 1);
  // Particles: an older point with a larger age means the particle respawned in between.
  bool valid = uKind == 0 ? (a.z >= 0.0 && b.z >= 0.0 && a.z > b.z) : (a.z > 0.0 && b.z > 0.0);
  vec2 pa = screen(a.xy);
  vec2 pb = screen(b.xy);
  vec2 d = pb - pa;
  float len = length(d);
  if (!valid || len < 1e-3) { hide(); return; }

  // Two triangles: (A-, A+, B-), (B-, A+, B+).
  bool atB = corner == 2 || corner == 3 || corner == 5;
  float side = (corner == 1 || corner == 4 || corner == 5) ? 1.0 : -1.0;
  vec2 n = vec2(-d.y, d.x) / len * (0.5 * uWidth);
  gl_Position = clip((atB ? pb : pa) + n * side);

  float t = (float(k) + (atB ? 1.0 : 0.0)) / float(segs);  // 0 at the first point, 1 at the last
  if (uKind == 0) {
    vAlpha = (1.0 - t) * lifeFade(line, point(line, 0));
  } else {
    float speed = atB ? b.w : a.w;
    float ends = 1.0 - smoothstep(0.7, 1.0, abs(t * 2.0 - 1.0));
    vAlpha = ends * mix(0.25, 1.0, smoothstep(0.05, uFullSpeed, speed));
  }
}
`,cn=`// Integer hash noise. Pasted in place of \`// #include random\`.
uint hashU(uint x) {
  x ^= x >> 16;
  x *= 0x7feb352du;
  x ^= x >> 15;
  x *= 0x846ca68bu;
  x ^= x >> 16;
  return x;
}

/** Uniform in [0, 1) from two integers. */
float rand01(uint a, uint b) { return float(hashU(a ^ hashU(b + 0x9e3779b9u)) >> 8) / 16777216.0; }

/** Particle lifetime in sim seconds, the same in the update and draw passes. */
float particleLife(uint id, float seed) { return 2.0 + 3.0 * rand01(id ^ 0x5bd1e995u, uint(seed)); }
`,ln=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp usampler2D;
// #include random
// #include field
// #include polyline

// Streamline tracing. Each line starts from a jittered seed and runs \`uHalf\` steps of
// fixed length backward (k < uHalf) and forward (k > uHalf) along the air. Texel =
// (x, y, 1 = valid / -1 = stopped, air speed there). A trace stops in still air,
// at walls, and at the grid edge.
uniform int uLen;        // 2 * uHalf + 1
uniform int uPerRow;
uniform int uHalf;
uniform int uSeedCols;
uniform float uSpacing;  // tiles between seeds
uniform float uStep;     // tiles per step

out vec4 outValue;

const float MIN_SPEED = 0.05;

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  int line = c.y * uPerRow + c.x / uLen;
  int k = c.x % uLen - uHalf;
  ivec2 cell = ivec2(line % uSeedCols, line / uSeedCols);
  vec2 jitter = vec2(rand01(uint(line), 1u), rand01(uint(line), 2u)) - 0.5;
  vec2 p = (vec2(cell) + 0.5 + 0.7 * jitter) * uSpacing;
  float dir = k < 0 ? -1.0 : 1.0;
  int n = abs(k);
  bool valid = openAir(p);
  for (int i = 0; i < 256; i++) {
    if (i >= n || !valid) break;
    vec2 v1 = velAt(p);
    float s1 = length(v1);
    if (s1 < MIN_SPEED) { valid = false; break; }
    vec2 mid = p + dir * (v1 / s1) * (0.5 * uStep);
    vec2 v2 = velAt(mid);
    float s2 = length(v2);
    if (s2 < MIN_SPEED) { valid = false; break; }
    p += dir * (v2 / s2) * uStep;
    valid = openAir(p);
  }
  outValue = vec4(p, valid ? 1.0 : -1.0, length(velAt(p)));
}
`,un={field:tn,random:cn,polyline:an},dn=0,fn=1,pn=2,mn=1024;function hn(e,t){let n=Math.max(1,Math.floor(mn/t));return{count:e,len:t,perRow:n,w:n*t,h:Math.ceil(e/n)}}function gn(e,t,n,r){e.activeTexture(e.TEXTURE0+n),e.bindTexture(e.TEXTURE_2D,r),t&&e.uniform1i(t,n)}function _n(e,t,n){gn(e,t.uVel,fn,n.velocity),gn(e,t.uTiles,pn,n.tiles),e.uniform2i(t.uSim,n.simShape[0],n.simShape[1]),e.uniform1i(t.uQuality,n.quality),e.uniform2i(t.uGrid,n.tileShape[0],n.tileShape[1])}function vn(e,t,n){e.disable(e.BLEND),e.bindFramebuffer(e.FRAMEBUFFER,n.fbo),e.viewport(0,0,n.w,n.h),e.bindVertexArray(t),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null)}var yn=class{gl;vao;program;u;constructor(e,t){this.gl=e,this.vao=t,this.program=Xt(e,Zt(sn,un),on),this.u=Qt(e,this.program)}draw(e,t,n,r,i,a,o=1){let s=this.gl,c=this.u;s.bindFramebuffer(s.FRAMEBUFFER,null),s.viewport(0,0,s.drawingBufferWidth,s.drawingBufferHeight),s.enable(s.BLEND),s.blendFunc(s.ONE,s.ONE_MINUS_SRC_ALPHA),s.useProgram(this.program),s.bindVertexArray(this.vao),gn(s,c.uState,dn,t),s.uniform1i(c.uKind,n),s.uniform1i(c.uLen,e.len),s.uniform1i(c.uPerRow,e.perRow),s.uniform2f(c.uRes,s.drawingBufferWidth,s.drawingBufferHeight),s.uniform2f(c.uOrigin,a.view.x*a.dpr,a.view.y*a.dpr),s.uniform1f(c.uScale,a.view.scale*a.dpr),s.uniform1f(c.uWidth,i),c.uFullSpeed&&s.uniform1f(c.uFullSpeed,o),s.uniform4fv(c.uColor,r),n===2?s.drawArrays(s.POINTS,0,e.count):s.drawArrays(s.TRIANGLES,0,e.count*(e.len-1)*6),s.disable(s.BLEND)}dispose(){this.gl.deleteProgram(this.program)}},bn=3,xn=512,Sn=8192,Cn=class{gl;vao;program;u;lines;store=hn(0,12);a=null;b=null;shape=[0,0];trailColor=new Float32Array([.08,.09,.11,.55]);headColor=new Float32Array([.08,.09,.11,.85]);needsSpawn=!0;constructor(e){this.gl=e,this.vao=e.createVertexArray(),this.program=Xt(e,nn,Zt(rn,un)),this.u=Qt(e,this.program),this.lines=new yn(e,this.vao)}resize(e){if(this.a&&yt(this.shape,e))return;this.free(),this.shape=[...e];let t=Math.round(gt(e)*bn);this.store=hn(Math.min(Sn,Math.max(xn,t)),12);let{w:n,h:r}=this.store,i=new Float32Array(n*r*4);for(let e=2;e<i.length;e+=4)i[e]=-1;this.a=$t(this.gl,n,r,i),this.b=$t(this.gl,n,r),this.needsSpawn=!0}step(e,t){let n=this.gl,r=this.u;this.resize(t.tileShape),n.useProgram(this.program),gn(n,r.uState,dn,this.a.tex),_n(n,r,t),n.uniform1i(r.uLen,this.store.len),n.uniform1i(r.uPerRow,this.store.perRow),n.uniform1f(r.uDt,e),vn(n,this.vao,this.b);let i=this.a;this.a=this.b,this.b=i,this.needsSpawn=!1}draw(e){if(!this.a)return;let t=Math.min(3,Math.max(1.25,e.view.scale*.05))*e.dpr;this.lines.draw(this.store,this.a.tex,0,this.trailColor,t,e),this.lines.draw(this.store,this.a.tex,2,this.headColor,t,e)}free(){this.a&&en(this.gl,this.a),this.b&&en(this.gl,this.b),this.a=this.b=null}dispose(){this.free(),this.lines.dispose(),this.gl.deleteProgram(this.program),this.gl.deleteVertexArray(this.vao)}},wn=.25,Tn=40,En=3,Dn=class{gl;vao;program;u;lines;store=hn(0,1);target=null;shape=[0,0];spacing=2;seedCols=1;half=1;color=new Float32Array([.1,.12,.16,.6]);traced=!1;constructor(e){this.gl=e,this.vao=e.createVertexArray(),this.program=Xt(e,nn,Zt(ln,un)),this.u=Qt(e,this.program),this.lines=new yn(e,this.vao)}resize(e){if(this.target&&yt(this.shape,e))return;this.target&&en(this.gl,this.target),this.shape=[...e];let[t,n]=e;this.spacing=Math.max(2,Math.ceil(Math.max(t,n)/Tn)),this.seedCols=Math.ceil(t/this.spacing);let r=this.seedCols*Math.ceil(n/this.spacing);this.half=Math.round(2*this.spacing/wn),this.store=hn(r,2*this.half+1),this.target=$t(this.gl,this.store.w,this.store.h),this.traced=!1}trace(e){let t=this.gl,n=this.u;this.resize(e.tileShape),t.useProgram(this.program),_n(t,n,e),t.uniform1i(n.uLen,this.store.len),t.uniform1i(n.uPerRow,this.store.perRow),t.uniform1i(n.uHalf,this.half),t.uniform1i(n.uSeedCols,this.seedCols),t.uniform1f(n.uSpacing,this.spacing),t.uniform1f(n.uStep,wn),vn(t,this.vao,this.target),this.traced=!0}draw(e){if(!this.target||!this.traced)return;let t=Math.min(2,Math.max(1,e.view.scale*.035))*e.dpr;this.lines.draw(this.store,this.target.tex,1,this.color,t,e,En)}dispose(){this.target&&en(this.gl,this.target),this.lines.dispose(),this.gl.deleteProgram(this.program),this.gl.deleteVertexArray(this.vao)}},On={[H.Air]:`rgba(255,255,255,0.55)`,[H.Wall]:`rgba(70,76,84,0.85)`,[H.Fan]:`rgba(40,150,90,0.85)`,[H.Heater]:`rgba(220,80,50,0.85)`,[H.Window]:`rgba(110,190,235,0.85)`},kn={replace:`#1f6feb`,add:`#1a9a4a`,subtract:`#d03030`},An=class{canvas;ctx;c=[0,0,0];constructor(e){this.canvas=e,this.ctx=e.getContext(`2d`)}draw(e){let{canvas:t,ctx:n}=this,r=Math.round(t.clientWidth*e.dpr),i=Math.round(t.clientHeight*e.dpr);(t.width!==r||t.height!==i)&&(t.width=r,t.height=i),n.setTransform(e.dpr,0,0,e.dpr,0,0),n.clearRect(0,0,t.clientWidth,t.clientHeight);let{view:a}=e,o=a.scale,s=e=>a.x+e*o,c=e=>a.y+e*o;e.selection.size>0&&this.drawSelection(e,s,c);let l=e.gesture;if(l.kind===`marquee`){let e=Math.min(l.x0,l.x1),t=Math.min(l.y0,l.y1),r=kn[l.mode];n.fillStyle=r,n.globalAlpha=.15,n.fillRect(s(e),c(t),(Math.abs(l.x1-l.x0)+1)*o,(Math.abs(l.y1-l.y0)+1)*o),n.globalAlpha=1,n.strokeStyle=r,n.setLineDash([5,3]),n.lineWidth=1.5,n.strokeRect(s(e),c(t),(Math.abs(l.x1-l.x0)+1)*o,(Math.abs(l.y1-l.y0)+1)*o),n.setLineDash([])}let u=e.floating;u.stamp&&this.drawStamp(u.stamp,u.ox,u.oy,s,c,o)}drawSelection(e,t,n){let{ctx:r,c:i}=this,a=e.view.scale,o=e.selection;r.fillStyle=`rgba(31,111,235,0.18)`,r.strokeStyle=`#1f6feb`,r.lineWidth=2,r.beginPath();for(let s of o){_t(e.shape,s,i);let c=i[0],l=i[1];r.fillRect(t(c),n(l),a,a);let u=(t,n)=>vt(e.shape,t,n)&&o.has(V(e.shape,t,n)),d=t(c),f=n(l);u(c-1,l)||(r.moveTo(d,f),r.lineTo(d,f+a)),u(c+1,l)||(r.moveTo(d+a,f),r.lineTo(d+a,f+a)),u(c,l-1)||(r.moveTo(d,f),r.lineTo(d+a,f)),u(c,l+1)||(r.moveTo(d,f+a),r.lineTo(d+a,f+a))}r.stroke()}drawStamp(e,t,n,r,i,a){let{ctx:o}=this;o.globalAlpha=.7;for(let s=0;s<e.h;s++)for(let c=0;c<e.w;c++){let l=e.cells[V([e.w,e.h],c,s)];if(l&&(o.fillStyle=On[l.type],o.fillRect(r(t+c),i(n+s),a,a),l.fan)){let e=l.fan.dir*Math.PI/4,u=r(t+c)+a/2,d=i(n+s)+a/2;o.strokeStyle=`#fff`,o.lineWidth=Math.max(1,a/8),o.beginPath(),o.moveTo(u,d),o.lineTo(u+Math.sin(e)*a*.4,d-Math.cos(e)*a*.4),o.stroke()}}o.globalAlpha=1,o.strokeStyle=`#1f2933`,o.setLineDash([5,3]),o.lineWidth=1.5,o.strokeRect(r(t),i(n),e.w*a,e.h*a),o.setLineDash([])}},jn=1/60,Mn=.03,Nn=.25,Pn=2.5,Fn=.05,In=Math.PI/4;function Ln(e){return 2*Math.PI*Fn*e}var Rn=.08,zn=1.5,Bn=-100,Vn=.2;function Hn(e,t){let n=t*t;return Math.max(1,Math.ceil(e*2*n/Vn))}var Un=`#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
precision highp sampler2D;

// Tile grid, drawn in two layers so particles and streamlines sit between them:
//   uLayer 0: base fill (air, or the heat map), opaque.
//   uLayer 1: tile glyphs, airflow arrows, hover, grid lines and selection, with
//             premultiplied alpha (transparent over plain air).
uniform int uLayer;
uniform usampler2D uTiles;
uniform sampler2D uTemp;  // R32F temperature, sim resolution
uniform ivec2 uSim;       // sim grid size
uniform int uQuality;     // sim cells per tile edge
uniform float uHeatOn;    // heat map overlay
uniform float uLo;        // heat scale range, C
uniform float uHi;
uniform sampler2D uTileAvg; // RGBA32F per tile: temperature, velocity x, velocity y
uniform float uArrows;      // airflow arrow overlay
uniform float uArrowFull;   // air speed (tiles/s) drawn as a full-length arrow
uniform vec2 uRes;       // drawing buffer size, device px
uniform vec2 uOrigin;    // grid top-left, device px (y down)
uniform float uScale;    // device px per tile
uniform float uDpr;
uniform ivec2 uGrid;
uniform float uGridLines;
uniform float uAmbient;
uniform ivec2 uSelected; // (-1,-1) = none
uniform ivec2 uHover;
uniform vec2 uDirs[8];   // unit direction vectors, y down
uniform float uSimTime;    // sim seconds (wrapped), drives the heater pulse
uniform float uSweepPhase; // sweepPhase(sim time), same as the solver
uniform float uSweepHalf;  // SWEEP_HALF_ANGLE

out vec4 outColor;

// Light, industrial palette.
const vec3 BG_OUTSIDE = vec3(0.85, 0.86, 0.87);
const vec3 AIR = vec3(0.94, 0.95, 0.95);
const vec3 WALL = vec3(0.30, 0.33, 0.37);
const vec3 PLATE = vec3(0.90, 0.91, 0.92);     // object plate (UI panel grey)
const vec3 PLATE_OFF = vec3(0.78, 0.80, 0.82); // powered-off plate
const vec3 GLASS = vec3(0.62, 0.80, 0.92);
const vec3 GLASS_DARK = vec3(0.28, 0.48, 0.62);
const vec3 INK = vec3(0.12, 0.13, 0.15);
const vec3 ACCENT = vec3(1.0, 0.48, 0.0);
const vec3 FAN_OFF = vec3(0.45, 0.48, 0.52);
const vec3 HEAT_GLOW = vec3(1.0, 0.62, 0.15);
const float TAU = 6.2831853;

// Heat ramp: blue (uLo) -> white (ambient) -> red (uHi). White always sits at ambient.
vec3 heatColor(float c) {
  vec3 blue = vec3(0.2, 0.4, 0.9);
  vec3 red = vec3(0.9, 0.15, 0.1);
  if (c >= uAmbient) return mix(vec3(1.0), red, clamp((c - uAmbient) / max(uHi - uAmbient, 1e-3), 0.0, 1.0));
  return mix(vec3(1.0), blue, clamp((uAmbient - c) / max(uAmbient - uLo, 1e-3), 0.0, 1.0));
}

// Bilinear temperature at tile coords \`t\` (manual: float textures may not filter).
float tempAt(vec2 t) {
  vec2 s = t * float(uQuality) - 0.5;
  vec2 b = floor(s);
  vec2 fr = s - b;
  ivec2 i0 = ivec2(b);
  ivec2 hi = uSim - 1;
  float a = texelFetch(uTemp, clamp(i0, ivec2(0), hi), 0).r;
  float bx = texelFetch(uTemp, clamp(i0 + ivec2(1, 0), ivec2(0), hi), 0).r;
  float cy = texelFetch(uTemp, clamp(i0 + ivec2(0, 1), ivec2(0), hi), 0).r;
  float d = texelFetch(uTemp, clamp(i0 + ivec2(1, 1), ivec2(0), hi), 0).r;
  return mix(mix(a, bx, fr.x), mix(cy, d, fr.x), fr.y);
}

// Fan level colour: green 1, yellow 3, red 5, blended in between.
vec3 levelColor(float level) {
  vec3 green = vec3(0.10, 0.78, 0.25);
  vec3 yellow = vec3(1.0, 0.82, 0.0);
  vec3 red = vec3(0.93, 0.12, 0.10);
  float t = clamp((level - 1.0) * 0.25, 0.0, 1.0);
  return t < 0.5 ? mix(green, yellow, t * 2.0) : mix(yellow, red, t * 2.0 - 1.0);
}

float sdBox(vec2 p, vec2 c, vec2 h) {
  vec2 q = abs(p - c) - h;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

// Zoomed out: sharp arrow pointing along +x whose length and weight grow with level.
float sdArrow(vec2 q, float level) {
  float tail = 0.1 - (0.14 + 0.05 * level);
  q.x += (0.4 + tail) * 0.5; // centre the whole arrow on the tile
  float shaft = sdBox(q, vec2((0.1 + tail) * 0.5, 0.0), vec2((0.1 - tail) * 0.5, 0.05 + 0.012 * level));
  float e1 = 0.08 - q.x;
  float e2 = (0.3 * abs(q.y) + 0.26 * q.x - 0.104) / 0.397;
  return min(shaft, max(e1, e2));
}

// Airflow arrow along +x, centred, total length \`len\` (tiles). Sharp shaft and head.
float sdFlowArrow(vec2 q, float len) {
  float head = min(0.18, len * 0.5);
  float hw = head * 0.65;
  float tip = len * 0.5;
  float base = tip - head;
  float shaft = sdBox(q, vec2((base - len * 0.5) * 0.5, 0.0), vec2((base + len * 0.5) * 0.5, 0.028));
  float e1 = base - q.x;
  float e2 = (abs(q.y) * head + (q.x - tip) * hw) / length(vec2(hw, head));
  return min(shaft, max(e1, e2));
}

// Zoomed in: one sharp chevron per level (the level ticks), stacked behind the front one.
float sdChevron(vec2 q, float tip) {
  float band = abs(q.x - tip + abs(q.y)) * 0.7071;
  return max(band - 0.025, abs(q.y) - 0.25);
}

vec2 rotate(vec2 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

// Composite colour \`c\` at coverage \`a\` over premultiplied \`o\`.
void over(inout vec4 o, vec3 c, float a) {
  o = o * (1.0 - a) + vec4(c * a, a);
}

// Object plates are flat and square with a dark edge, like the UI controls.
// State reads from the whole plate, so it holds at any zoom:
//   on  = coloured plate (fan: level colour, heater: target temperature)
//   off = flat grey plate, hollow/greyed marks and a slash
// Fine detail (level ticks, sweep arc, radiator lines, LED) fades in with zoom.

// 1 on the outer edge band of the tile: about 2.5 device px when zoomed in, never
// under 1 px and never more than 7% of the tile, so small tiles keep their fill.
float edgeBand(vec2 f, float aa) {
  float w = max(aa, min(2.5 * aa, 0.07));
  return smoothstep(0.5 - w - aa, 0.5 - w + aa, max(abs(f.x), abs(f.y)));
}

// Power-off slash, bottom-left to top-right.
float slash(vec2 f, float aa) {
  float d = abs(f.x + f.y) * 0.7071;
  float inside = 1.0 - smoothstep(0.40, 0.40 + aa, max(abs(f.x), abs(f.y)));
  return (1.0 - smoothstep(0.035 - aa, 0.035 + aa, d)) * inside;
}

// Fan: plate tinted by level (green 1, yellow 3, red 5) with a dark arrow (zoomed out)
// or one chevron per level (zoomed in). Off: grey plate, hollow arrow, slash. While
// oscillating the arrow swings with the solver's sweep, over a faint arc of the range.
vec4 fanGlyph(uvec4 d, vec2 f, float aa) {
  float level = max(float(d.b), 1.0);
  bool on = (d.g & 128u) != 0u;
  bool osc = (d.g & 8u) != 0u;
  vec2 setDir = uDirs[d.g & 7u];
  vec2 v = setDir;
  if (on && osc) v = rotate(setDir, uSweepHalf * sin(float((d.g >> 4) & 7u) * uSweepPhase));
  vec3 col = on ? mix(PLATE, levelColor(level), 0.55) : PLATE_OFF;

  if (osc && uScale >= 10.0 * uDpr) {
    float r = length(f);
    float ang = acos(clamp(dot(f / max(r, 1e-4), setDir), -1.0, 1.0));
    float ring = abs(r - 0.42) - max(0.015, 0.5 * aa);
    float wedge = (ang - uSweepHalf) * r;
    float arc = max(ring, wedge);
    col = mix(col, INK, (on ? 0.55 : 0.3) * (1.0 - smoothstep(-aa, aa, arc)));
  }

  vec2 q = vec2(dot(f, v), dot(f, vec2(-v.y, v.x)));
  float dist = 1e3;
  bool chevrons = uScale >= 24.0 * uDpr;
  if (chevrons) {
    float front = 0.125 + 0.07 * (level - 1.0);
    for (int k = 0; k < 5; k++) {
      if (float(k) >= level) break;
      dist = min(dist, sdChevron(q, front - 0.14 * float(k)));
    }
  } else {
    dist = sdArrow(q, level);
  }
  if (on) {
    col = mix(col, INK, 1.0 - smoothstep(-aa, aa, dist));
  } else {
    // Hollow: outline only, in grey.
    float line = chevrons ? dist : abs(dist) - max(0.02, aa);
    col = mix(col, FAN_OFF, 1.0 - smoothstep(-aa, aa, line));
    col = mix(col, FAN_OFF, slash(f, aa));
  }
  col = mix(col, on ? INK : FAN_OFF, edgeBand(f, aa));
  return vec4(col, 1.0);
}

// Heater: plate filled with its target temperature on the heat scale. Radiator lines
// rise from the bottom for the output rate (a bar when tiles are small). Heating: the
// plate pulses orange and a lamp lights. Off: grey plate, grey lines, slash.
vec4 heaterGlyph(uvec4 d, ivec2 ti, vec2 f, float aa) {
  float target = float(d.b);
  bool on = d.g >= 128u;
  float rate = float(d.g & 7u);
  vec3 col = heatColor(target);
  if (!on) col = PLATE_OFF;
  float tileTemp = texelFetch(uTileAvg, ti, 0).r;
  bool heating = on && tileTemp < target - 0.5;
  float pulse = 0.5 + 0.5 * sin(TAU * uSimTime);
  if (heating) col = mix(col, HEAT_GLOW, 0.5 * pulse);

  vec3 mark = on ? INK : FAN_OFF;
  if (uScale >= 10.0 * uDpr) {
    float th = max(0.04, aa);
    for (int i = 0; i < 5; i++) {
      if (float(i) >= rate) break;
      float dist = sdBox(f, vec2(0.0, 0.3 - 0.14 * float(i)), vec2(0.28, th));
      col = mix(col, mark, 1.0 - smoothstep(-aa, aa, dist));
    }
  } else {
    float h = 0.1 + 0.1 * rate;
    float dist = sdBox(f, vec2(0.0, 0.38 - 0.5 * h), vec2(0.3, 0.5 * h));
    col = mix(col, mark, 1.0 - smoothstep(-aa, aa, dist));
  }
  if (heating && uScale >= 14.0 * uDpr) {
    float lamp = sdBox(f, vec2(0.3, -0.3), vec2(0.065));
    col = mix(col, ACCENT, 1.0 - smoothstep(-aa, aa, lamp));
    col = mix(col, INK, 1.0 - smoothstep(-aa, aa, abs(lamp) - max(0.015, aa)));
  }
  if (!on) col = mix(col, FAN_OFF, slash(f, aa));
  col = mix(col, on ? INK : FAN_OFF, edgeBand(f, aa));
  return vec4(col, 1.0);
}

// Window: closed is a solid pane in a frame with glazing bars; open is the frame only
// (air shows through) with the sash swung across it.
vec4 windowGlyph(uvec4 d, vec2 f, float aa) {
  bool open = d.g == 1u;
  float m = max(abs(f.x), abs(f.y));
  float frame = smoothstep(0.5 - 0.13 - aa, 0.5 - 0.13 + aa, m);
  float outer = edgeBand(f, aa);
  if (open) {
    float sash = 0.0;
    if (uScale >= 8.0 * uDpr) {
      sash = (1.0 - smoothstep(0.03 - aa, 0.03 + aa, abs(f.x - f.y) * 0.7071)) * (1.0 - frame);
    }
    float a = max(max(frame, sash), outer);
    return vec4(mix(GLASS_DARK, INK, outer) * a, a);
  }
  vec3 col = mix(GLASS, GLASS_DARK, frame);
  float bar = min(abs(f.x), abs(f.y));
  col = mix(col, GLASS_DARK, 1.0 - smoothstep(0.02 - aa, 0.02 + aa, bar));
  col = mix(col, INK, outer);
  return vec4(col, 1.0);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 t = (px - uOrigin) / uScale;
  bool outside = t.x < 0.0 || t.y < 0.0 || t.x >= float(uGrid.x) || t.y >= float(uGrid.y);
  vec3 air = outside ? BG_OUTSIDE : (uHeatOn > 0.5 ? heatColor(tempAt(t)) : AIR);
  if (uLayer == 0 || outside) {
    outColor = uLayer == 0 ? vec4(air, 1.0) : vec4(0.0);
    return;
  }

  ivec2 ti = ivec2(floor(t));
  vec2 f = fract(t) - 0.5;            // tile-local, -0.5..0.5, y down
  float aa = 1.0 / uScale;            // one device px in tile units
  uvec4 d = texelFetch(uTiles, ti, 0);
  uint type = d.r;

  vec4 o = vec4(0.0);
  if (type == 1u) {
    // Steel wall with a faint diagonal hatch.
    float h = step(0.5, fract((t.x + t.y) * 2.0));
    o = vec4(WALL * (1.0 - 0.07 * h), 1.0);
  } else if (type == 2u) {
    o = fanGlyph(d, f, aa);
  } else if (type == 3u) {
    o = heaterGlyph(d, ti, f, aa);
  } else if (type == 4u) {
    o = windowGlyph(d, f, aa);
  }

  // Airflow arrows: one per tile, over air, heaters and open windows.
  bool passable = type == 0u || type == 3u || (type == 4u && d.g == 1u);
  if (uArrows > 0.5 && passable && uScale >= 6.0 * uDpr) {
    vec2 vel = texelFetch(uTileAvg, ti, 0).gb;
    float speed = length(vel);
    float k = clamp(speed / uArrowFull, 0.0, 1.0);
    float alpha = smoothstep(0.02, 0.15, k);
    if (alpha > 0.0) {
      vec2 dir = vel / speed;
      vec2 q = vec2(dot(f, dir), dot(f, vec2(-dir.y, dir.x)));
      float dist = sdFlowArrow(q, 0.25 + 0.6 * k);
      over(o, INK, 0.85 * alpha * (1.0 - smoothstep(-aa, aa, dist)));
    }
  }

  if (ti == uHover) over(o, ACCENT, 0.12);

  if (uGridLines > 0.5) {
    float e = min((0.5 - abs(f.x)) * uScale, (0.5 - abs(f.y)) * uScale); // device px to nearest edge
    float line = 1.0 - smoothstep(0.0, 1.0, e);
    float fade = smoothstep(3.0, 10.0, uScale / uDpr);
    vec3 under = o.rgb + air * (1.0 - o.a);
    vec3 lc = dot(under, vec3(0.333)) < 0.4 ? vec3(1.0) : vec3(0.0);
    over(o, lc, 0.3 * line * fade);
  }

  if (ti == uSelected) {
    float e = (0.5 - max(abs(f.x), abs(f.y))) * uScale;
    over(o, ACCENT, 1.0 - smoothstep(1.5 * uDpr, 2.5 * uDpr, e));
  }

  outColor = o;
}
`;function Wn(e,t,n,r){let i=e.typeAt(t);if(n[r]=i,n[r+1]=0,n[r+2]=0,n[r+3]=0,i===H.Fan){let i=e.fans.get(t);i&&(n[r+1]=i.dir|(i.oscillate?8:0)|i.sweepSpeed<<4|(i.on?128:0),n[r+2]=i.level)}else if(i===H.Heater){let i=e.heaters.get(t);i&&(n[r+1]=i.outputRate|(i.on?128:0),n[r+2]=i.targetC)}else if(i===H.Window){let i=e.windows.get(t);i&&(n[r+1]=+!!i.open)}}var Gn=6,Kn=512,qn=class{gl;program;vao;texture;u={};shape=[0,0];data=new Uint8Array;scratch=new Uint8Array(4);coords=[0,0,0];dirs=new Float32Array(16);layout=null;tracker=null;onDirty=e=>this.uploadOne(e);constructor(e){this.gl=e,this.program=Xt(e,nn,Un),this.vao=e.createVertexArray(),this.texture=e.createTexture();for(let t of[`uTiles`,`uRes`,`uOrigin`,`uScale`,`uDpr`,`uGrid`,`uGridLines`,`uAmbient`,`uSelected`,`uHover`,`uDirs`,`uTemp`,`uSim`,`uQuality`,`uHeatOn`,`uLo`,`uHi`,`uTileAvg`,`uArrows`,`uArrowFull`,`uLayer`,`uSimTime`,`uSweepPhase`,`uSweepHalf`])this.u[t]=e.getUniformLocation(this.program,t);xt.forEach(([e,t],n)=>{let r=Math.hypot(e,t);this.dirs[n*2]=e/r,this.dirs[n*2+1]=t/r})}get tiles(){return this.texture}sync(e){let t=this.gl;this.layout!==e&&(this.layout=e,this.tracker=e.track());let n=this.tracker;if(t.bindTexture(t.TEXTURE_2D,this.texture),yt(this.shape,e.shape)||(this.shape=e.shape,this.data=new Uint8Array(gt(e.shape)*4),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texImage2D(t.TEXTURE_2D,0,t.RGBA8UI,e.shape[0],e.shape[1],0,t.RGBA_INTEGER,t.UNSIGNED_BYTE,this.data),n.markAll()),n.count>Kn&&n.markAll(),n.consumeAll()){for(let t=0;t<e.types.length;t++)Wn(e,t,this.data,t*4);t.texSubImage2D(t.TEXTURE_2D,0,0,0,e.shape[0],e.shape[1],t.RGBA_INTEGER,t.UNSIGNED_BYTE,this.data)}else n.drain(this.onDirty)}uploadOne(e){let t=this.gl,n=this.layout;Wn(n,e,this.data,e*4),_t(n.shape,e,this.coords),this.scratch.set(this.data.subarray(e*4,e*4+4)),t.texSubImage2D(t.TEXTURE_2D,0,this.coords[0],this.coords[1],1,1,t.RGBA_INTEGER,t.UNSIGNED_BYTE,this.scratch)}draw(e,t){let n=this.gl,{u:r}=this;n.bindFramebuffer(n.FRAMEBUFFER,null),n.viewport(0,0,n.drawingBufferWidth,n.drawingBufferHeight),t===1?(n.enable(n.BLEND),n.blendFunc(n.ONE,n.ONE_MINUS_SRC_ALPHA)):n.disable(n.BLEND),n.useProgram(this.program),n.uniform1i(r.uLayer,t),n.uniform1f(r.uSimTime,e.simTime),n.uniform1f(r.uSweepPhase,Ln(e.simTime)),n.uniform1f(r.uSweepHalf,In),n.bindVertexArray(this.vao),n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,this.texture),n.uniform1i(r.uTiles,0),n.uniform2f(r.uRes,n.drawingBufferWidth,n.drawingBufferHeight),n.uniform2f(r.uOrigin,e.view.x*e.dpr,e.view.y*e.dpr),n.uniform1f(r.uScale,e.view.scale*e.dpr),n.uniform1f(r.uDpr,e.dpr),n.uniform2i(r.uGrid,this.shape[0],this.shape[1]),n.uniform1f(r.uGridLines,+!!e.showGrid),n.uniform1f(r.uAmbient,e.ambientC),n.uniform2i(r.uSelected,e.selected[0],e.selected[1]),n.uniform2i(r.uHover,e.hover[0],e.hover[1]),n.uniform2fv(r.uDirs,this.dirs),n.activeTexture(n.TEXTURE1),n.bindTexture(n.TEXTURE_2D,e.heat.texture),n.uniform1i(r.uTemp,1),n.uniform2i(r.uSim,e.heat.simShape[0],e.heat.simShape[1]),n.uniform1i(r.uQuality,e.heat.quality),n.uniform1f(r.uHeatOn,+!!e.heat.on),n.uniform1f(r.uLo,e.heat.lo),n.uniform1f(r.uHi,e.heat.hi),n.activeTexture(n.TEXTURE2),n.bindTexture(n.TEXTURE_2D,e.flow.texture),n.uniform1i(r.uTileAvg,2),n.uniform1f(r.uArrows,+!!e.flow.arrows),n.uniform1f(r.uArrowFull,Gn),n.drawArrays(n.TRIANGLES,0,3),n.disable(n.BLEND)}};function Jn(e,t,n,r){let i=2,a=0,o=0,s=0,c=0,l=0,u=0,d=0;switch(e.typeAt(t)){case H.Wall:i=Mn,a=1;break;case H.Fan:{let n=e.fans.get(t);if(n&&n.on){let[e,t]=xt[n.dir],r=Math.hypot(e,t);c=e/r,l=t/r,u=n.level*Pn,n.oscillate&&(d=n.sweepSpeed)}break}case H.Heater:{let n=e.heaters.get(t);n&&(o=n.targetC,s=n.on?n.outputRate:0);break}case H.Window:e.windows.get(t)?.open||(i=Nn,a=1)}n[r]=i,n[r+1]=a,n[r+2]=o,n[r+3]=s,n[r+4]=c,n[r+5]=l,n[r+6]=u,n[r+7]=d}var Yn=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Semi-Lagrangian advection of temperature. Outside the grid reads ambient (open edges).
// Solid cells keep their temperature. Mirrors CpuSim.advectTemp.
uniform sampler2D uTemp;
uniform sampler2D uVel;
uniform float uDt;
uniform float uAmbient;
uniform float uTMin;
uniform float uTMax;

out vec4 outValue;

float tap(ivec2 c) { return outsideGrid(c) ? uAmbient : texelFetch(uTemp, c, 0).r; }

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  float t = texelFetch(uTemp, c, 0).r;
  if (!solidAt(c)) {
    vec2 v = texelFetch(uVel, c, 0).xy;
    vec2 s = vec2(c) + 0.5 - uDt * v * float(uQuality) - 0.5;
    vec2 b = floor(s);
    vec2 f = s - b;
    ivec2 i0 = ivec2(b);
    float a = mix(tap(i0), tap(i0 + ivec2(1, 0)), f.x);
    float d = mix(tap(i0 + ivec2(0, 1)), tap(i0 + ivec2(1, 1)), f.x);
    t = mix(a, d, f.y);
    if (isnan(t) || isinf(t)) t = uAmbient;
    t = clamp(t, uTMin, uTMax);
  }
  outValue = vec4(t, 0.0, 0.0, 1.0);
}
`,Xn=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Semi-Lagrangian self-advection of velocity. Taps clamp to the grid edge.
// Mirrors CpuSim.advectVel.
uniform sampler2D uVel;
uniform float uDt;

out vec4 outValue;

vec2 tap(ivec2 c) { return texelFetch(uVel, clampCell(c), 0).xy; }

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec2 result = vec2(0.0);
  if (!solidAt(c)) {
    vec2 v = texelFetch(uVel, c, 0).xy;
    vec2 s = vec2(c) + 0.5 - uDt * v * float(uQuality) - 0.5;
    vec2 b = floor(s);
    vec2 f = s - b;
    ivec2 i0 = ivec2(b);
    vec2 a = mix(tap(i0), tap(i0 + ivec2(1, 0)), f.x);
    vec2 d = mix(tap(i0 + ivec2(0, 1)), tap(i0 + ivec2(1, 1)), f.x);
    result = mix(a, d, f.y);
  }
  outValue = vec4(result, 0.0, 1.0);
}
`,Zn=`// Shared by the sim passes. GlSolver pastes this in place of the \`// #include common\` line.
uniform sampler2D uPropsA;  // tile res: conductivity, solid, heater target, heater rate
uniform sampler2D uPropsB;  // tile res: fan dir x, fan dir y, fan speed, unused
uniform ivec2 uSim;         // sim grid size in cells
uniform int uQuality;       // cells per tile edge

const ivec2 OFFS[4] = ivec2[4](ivec2(1, 0), ivec2(-1, 0), ivec2(0, 1), ivec2(0, -1));

bool outsideGrid(ivec2 c) { return c.x < 0 || c.y < 0 || c.x >= uSim.x || c.y >= uSim.y; }
ivec2 clampCell(ivec2 c) { return clamp(c, ivec2(0), uSim - 1); }
vec4 propsA(ivec2 c) { return texelFetch(uPropsA, c / uQuality, 0); }
vec4 propsB(ivec2 c) { return texelFetch(uPropsB, c / uQuality, 0); }
bool solidAt(ivec2 c) { return propsA(c).g > 0.5; }
bool onEdge(ivec2 c) { return c.x == 0 || c.y == 0 || c.x == uSim.x - 1 || c.y == uSim.y - 1; }
`,Qn=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Vorticity (scalar curl in 2D). Mirrors CpuSim.computeCurl.
uniform sampler2D uVel;

out vec4 outValue;

vec2 vel(ivec2 c) { return texelFetch(uVel, clampCell(c), 0).xy; }

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  float dvdx = vel(c + ivec2(1, 0)).y - vel(c - ivec2(1, 0)).y;
  float dudy = vel(c + ivec2(0, 1)).x - vel(c - ivec2(0, 1)).x;
  outValue = vec4((dvdx - dudy) * 0.5 * float(uQuality), 0.0, 0.0, 1.0);
}
`,$n=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// One explicit diffusion substep with per-tile conductivity. Grid edges are open
// air at ambient. Mirrors CpuSim.diffuse.
uniform sampler2D uTemp;
uniform float uDt;
uniform float uInvH2;
uniform float uAmbient;
uniform float uKOutside;
uniform float uTMin;
uniform float uTMax;

out vec4 outValue;

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  float t = texelFetch(uTemp, c, 0).r;
  float k = propsA(c).r;
  float sum = 0.0;
  for (int i = 0; i < 4; i++) {
    ivec2 n = c + OFFS[i];
    float tn;
    float kn;
    if (outsideGrid(n)) {
      tn = uAmbient;
      kn = uKOutside;
    } else {
      tn = texelFetch(uTemp, n, 0).r;
      kn = propsA(n).r;
    }
    float kf = 2.0 * k * kn / max(k + kn, 1e-6);
    sum += kf * (tn - t);
  }
  t += uDt * uInvH2 * sum;
  if (isnan(t) || isinf(t)) t = uAmbient;
  outValue = vec4(clamp(t, uTMin, uTMax), 0.0, 0.0, 1.0);
}
`,er=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Velocity divergence. Open edges: zero gradient. Solids: no flow in. Mirrors CpuSim.divergence.
uniform sampler2D uVel;

out vec4 outValue;

vec2 velFor(ivec2 c, ivec2 n) {
  if (outsideGrid(n)) return texelFetch(uVel, c, 0).xy;
  if (solidAt(n)) return vec2(0.0);
  return texelFetch(uVel, n, 0).xy;
}

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  float d = 0.0;
  if (!solidAt(c)) {
    float du = velFor(c, c + ivec2(1, 0)).x - velFor(c, c - ivec2(1, 0)).x;
    float dv = velFor(c, c + ivec2(0, 1)).y - velFor(c, c - ivec2(0, 1)).y;
    d = (du + dv) * 0.5 * float(uQuality);
  }
  outValue = vec4(d, 0.0, 0.0, 1.0);
}
`,tr=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Heater thermostat plus sanitize. Mirrors CpuSim.heatSource.
uniform sampler2D uTemp;
uniform float uDt;
uniform float uPower;
uniform float uAmbient;
uniform float uTMin;
uniform float uTMax;

out vec4 outValue;

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec4 p = propsA(c);
  float t = texelFetch(uTemp, c, 0).r;
  if (p.a > 0.0 && t < p.b) t = min(p.b, t + p.a * uPower * uDt);
  if (isnan(t) || isinf(t)) t = uAmbient;
  outValue = vec4(clamp(t, uTMin, uTMax), 0.0, 0.0, 1.0);
}
`,nr=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// One Jacobi iteration of the pressure solve. Open edges: pressure 0. Solids mirror
// the centre (no flow through them). Mirrors CpuSim.jacobi.
uniform sampler2D uPressure;
uniform sampler2D uDiv;
uniform float uH2;

out vec4 outValue;

float pFor(ivec2 c, ivec2 n) {
  if (outsideGrid(n)) return 0.0;
  if (solidAt(n)) return texelFetch(uPressure, c, 0).r;
  return texelFetch(uPressure, n, 0).r;
}

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  float p = 0.0;
  if (!solidAt(c)) {
    float sum = 0.0;
    for (int i = 0; i < 4; i++) sum += pFor(c, c + OFFS[i]);
    p = (sum - uH2 * texelFetch(uDiv, c, 0).r) * 0.25;
  }
  outValue = vec4(p, 0.0, 0.0, 1.0);
}
`,rr=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Subtract the pressure gradient, zero solids, sanitize and clamp speed. Mirrors CpuSim.project.
uniform sampler2D uVel;
uniform sampler2D uPressure;
uniform float uVMax;

out vec4 outValue;

float pFor(ivec2 c, ivec2 n) {
  if (outsideGrid(n)) return 0.0;
  if (solidAt(n)) return texelFetch(uPressure, c, 0).r;
  return texelFetch(uPressure, n, 0).r;
}

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec2 v = vec2(0.0);
  if (!solidAt(c)) {
    float half_q = 0.5 * float(uQuality);
    v = texelFetch(uVel, c, 0).xy;
    v.x -= (pFor(c, c + ivec2(1, 0)) - pFor(c, c - ivec2(1, 0))) * half_q;
    v.y -= (pFor(c, c + ivec2(0, 1)) - pFor(c, c - ivec2(0, 1))) * half_q;
    if (any(isnan(v)) || any(isinf(v))) v = vec2(0.0);
    float s = length(v);
    if (s > uVMax) v *= uVMax / s;
  }
  outValue = vec4(v, 0.0, 1.0);
}
`,ir=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Resample a field from an old sim grid onto the current one (new quality and/or tile
// grid, anchored top-left). Cells over tiles the old grid didn't have get uFill.
// Mirrors CpuSim.resampleFrom.
uniform sampler2D uSrc;
uniform ivec2 uSrcSim;      // old sim grid size, cells
uniform int uSrcQuality;    // old cells per tile edge
uniform vec4 uFill;

out vec4 outValue;

vec4 tap(ivec2 c) { return texelFetch(uSrc, clamp(c, ivec2(0), uSrcSim - 1), 0); }

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec2 p = (vec2(c) + 0.5) / float(uQuality);  // tile coords of this cell's centre
  vec2 srcTiles = vec2(uSrcSim / uSrcQuality);
  if (p.x >= srcTiles.x || p.y >= srcTiles.y) {
    outValue = uFill;
    return;
  }
  vec2 s = p * float(uSrcQuality) - 0.5;
  vec2 b = floor(s);
  vec2 f = s - b;
  ivec2 i0 = ivec2(b);
  vec4 a = mix(tap(i0), tap(i0 + ivec2(1, 0)), f.x);
  vec4 d = mix(tap(i0 + ivec2(0, 1)), tap(i0 + ivec2(1, 1)), f.x);
  outValue = mix(a, d, f.y);
}
`,ar=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Per-tile means of temperature and velocity, for readback and the arrow overlay.
uniform sampler2D uTemp;
uniform sampler2D uVel;

out vec4 outValue;

void main() {
  ivec2 tile = ivec2(gl_FragCoord.xy);
  vec3 sum = vec3(0.0);
  for (int j = 0; j < 4; j++) {
    for (int i = 0; i < 4; i++) {
      if (i < uQuality && j < uQuality) {
        ivec2 c = tile * uQuality + ivec2(i, j);
        sum += vec3(texelFetch(uTemp, c, 0).r, texelFetch(uVel, c, 0).xy);
      }
    }
  }
  outValue = vec4(sum / float(uQuality * uQuality), 1.0);
}
`,or=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Fan momentum and (gravity on) buoyancy. Solids have no velocity. Mirrors CpuSim.velSource.
uniform sampler2D uVel;
uniform sampler2D uTemp;
uniform float uDt;
uniform float uFanK;        // 1 - exp(-FAN_RESPONSE * dt)
uniform float uGravity;     // 0 / 1
uniform float uBuoyancy;
uniform float uAmbient;
uniform float uSweepPhase;  // sweepPhase(time)
uniform float uSweepHalf;   // SWEEP_HALF_ANGLE

out vec4 outValue;

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec2 v = texelFetch(uVel, c, 0).xy;
  if (solidAt(c)) {
    v = vec2(0.0);
  } else {
    vec4 fan = propsB(c);
    if (fan.z > 0.0) {
      vec2 dir = fan.xy;
      if (fan.w > 0.0) {
        // Oscillating: rotate the set direction by the current sweep angle.
        float a = uSweepHalf * sin(fan.w * uSweepPhase);
        float ca = cos(a);
        float sa = sin(a);
        dir = vec2(ca * dir.x - sa * dir.y, sa * dir.x + ca * dir.y);
      }
      v += (dir * fan.z - v) * uFanK;
    }
    if (uGravity > 0.5) v.y -= uBuoyancy * (texelFetch(uTemp, c, 0).r - uAmbient) * uDt;
  }
  outValue = vec4(v, 0.0, 1.0);
}
`,sr=`#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Vorticity confinement ("Swirl"): push along N x w to restore small swirls the
// solver blurs away. Mirrors CpuSim.vorticity.
uniform sampler2D uVel;
uniform sampler2D uCurl;
uniform float uDt;
uniform float uEps;   // VORTICITY_STRENGTH * swirl * h

out vec4 outValue;

float curlAt(ivec2 c) { return texelFetch(uCurl, clampCell(c), 0).r; }

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec2 v = texelFetch(uVel, c, 0).xy;
  if (!solidAt(c) && !onEdge(c)) {
    float half_q = 0.5 * float(uQuality);
    float gx = (abs(curlAt(c + ivec2(1, 0))) - abs(curlAt(c - ivec2(1, 0)))) * half_q;
    float gy = (abs(curlAt(c + ivec2(0, 1))) - abs(curlAt(c - ivec2(0, 1)))) * half_q;
    float len = sqrt(gx * gx + gy * gy) + 1e-5;
    float w = curlAt(c);
    v += uEps * vec2(gy / len * w, -gx / len * w) * uDt;
  }
  outValue = vec4(v, 0.0, 1.0);
}
`;function cr(e,t){return e.map(e=>e*t)}var lr=class{a;b;constructor(e,t){this.a=e,this.b=t}swap(){let e=this.a;this.a=this.b,this.b=e}},U=0,ur=1,dr=2,fr=3,pr=512,mr=class{gl;tileShape=[0,0];quality=2;simShape=[0,0];time=0;vao;passes={};fields=null;propsA;propsB;propsDataA=new Float32Array;propsDataB=new Float32Array;propsScratch=new Float32Array(8);coords=[0,0,0];readBuf=new Float32Array;params={ambientC:20,gravity:!1,swirl:0};layout=null;avgStale=!0;readStale=!0;clearColor=new Float32Array(4);onDirty=e=>this.uploadTile(e);constructor(e,t,n){this.gl=e,this.vao=e.createVertexArray();let r={heatSource:tr,velSource:or,advectTemp:Yn,advectVel:Xn,diffuse:$n,curl:Qn,vorticity:sr,divergence:er,pressure:nr,project:rr,tileAverage:ar,resample:ir};for(let[e,t]of Object.entries(r))this.passes[e]=this.compile(t);this.propsA=e.createTexture(),this.propsB=e.createTexture(),this.resize(t,n)}get temp(){return this.fields.temp}get vel(){return this.fields.vel}get pressure(){return this.fields.pressure}get div(){return this.fields.div}get curl(){return this.fields.curl}get avg(){return this.fields.avg}get temperature(){return this.temp.a.tex}get velocity(){return this.vel.a.tex}get tileAverages(){return this.refreshAverages(),this.avg.tex}compile(e){let t=this.gl,n=Xt(t,nn,e.replace(`// #include common`,Zn)),r={},i=t.getProgramParameter(n,t.ACTIVE_UNIFORMS);for(let e=0;e<i;e++){let i=t.getActiveUniform(n,e).name;r[i]=t.getUniformLocation(n,i)}return{program:n,u:r}}texture(e,t,n,r,i){let a=this.gl.createTexture();return this.setupTexture(a,e,t,n,r,i),a}setupTexture(e,t,n,r,i,a){let o=this.gl;o.bindTexture(o.TEXTURE_2D,e),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),o.texImage2D(o.TEXTURE_2D,0,r,t,n,0,i,o.FLOAT,a)}target(e,t,n,r){let i=this.gl,a=this.texture(e,t,n,r,null),o=i.createFramebuffer();i.bindFramebuffer(i.FRAMEBUFFER,o),i.framebufferTexture2D(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,a,0);let s=i.checkFramebufferStatus(i.FRAMEBUFFER);if(i.bindFramebuffer(i.FRAMEBUFFER,null),s!==i.FRAMEBUFFER_COMPLETE)throw Error(`Float render target incomplete (0x${s.toString(16)}).`);return{tex:a,fbo:o}}free(e){this.gl.deleteTexture(e.tex),this.gl.deleteFramebuffer(e.fbo)}freeFields(e){for(let t of[e.temp,e.vel,e.pressure])this.free(t.a),this.free(t.b);this.free(e.div),this.free(e.curl),this.free(e.avg)}resize(e,t){let n=this.gl,r=this.fields,i=this.simShape,a=this.quality;this.tileShape=[...e],this.quality=t,this.simShape=cr(e,t);let[o,s]=this.simShape,[c,l]=this.tileShape,u=()=>this.target(o,s,n.R32F,n.RED),d=()=>this.target(o,s,n.RG32F,n.RG);this.fields={temp:new lr(u(),u()),vel:new lr(d(),d()),pressure:new lr(u(),u()),div:u(),curl:u(),avg:this.target(c,l,n.RGBA32F,n.RGBA)},this.readBuf=new Float32Array(c*l*4);let f=gt(e);if(this.propsDataA=new Float32Array(f*4),this.propsDataB=new Float32Array(f*4),this.setupTexture(this.propsA,c,l,n.RGBA32F,n.RGBA,this.propsDataA),this.setupTexture(this.propsB,c,l,n.RGBA32F,n.RGBA,this.propsDataB),this.layout=null,!r)this.reset();else{this.clear(this.temp.b,this.params.ambientC);for(let e of[this.vel.b,this.pressure.a,this.pressure.b,this.div,this.curl])this.clear(e,0);this.resample(r.temp.a,this.temp.a,i,a,this.params.ambientC),this.resample(r.vel.a,this.vel.a,i,a,0),this.freeFields(r),this.avgStale=!0,this.readStale=!0}}resample(e,t,n,r,i){let a=this.gl;a.disable(a.BLEND),a.bindVertexArray(this.vao),a.viewport(0,0,this.simShape[0],this.simShape[1]);let o=this.begin(this.passes.resample,t);this.bind(o.uSrc,U,e.tex),o.uSrcSim&&a.uniform2i(o.uSrcSim,n[0],n[1]),o.uSrcQuality&&a.uniform1i(o.uSrcQuality,r),o.uFill&&a.uniform4f(o.uFill,i,0,0,0),this.draw(),a.bindFramebuffer(a.FRAMEBUFFER,null)}setTiles(e,t){if((this.layout!==e||t.count>pr)&&t.markAll(),this.layout=e,t.consumeAll()){let t=this.gl,n=this.propsScratch;for(let t=0;t<e.types.length;t++)Jn(e,t,n,0),this.propsDataA.set(n.subarray(0,4),t*4),this.propsDataB.set(n.subarray(4,8),t*4);let[r,i]=this.tileShape;t.bindTexture(t.TEXTURE_2D,this.propsA),t.texSubImage2D(t.TEXTURE_2D,0,0,0,r,i,t.RGBA,t.FLOAT,this.propsDataA),t.bindTexture(t.TEXTURE_2D,this.propsB),t.texSubImage2D(t.TEXTURE_2D,0,0,0,r,i,t.RGBA,t.FLOAT,this.propsDataB)}else t.drain(this.onDirty)}uploadTile(e){let t=this.gl,n=this.propsScratch;Jn(this.layout,e,n,0),_t(this.tileShape,e,this.coords);let r=this.coords[0],i=this.coords[1];t.bindTexture(t.TEXTURE_2D,this.propsA),t.texSubImage2D(t.TEXTURE_2D,0,r,i,1,1,t.RGBA,t.FLOAT,n,0),t.bindTexture(t.TEXTURE_2D,this.propsB),t.texSubImage2D(t.TEXTURE_2D,0,r,i,1,1,t.RGBA,t.FLOAT,n,4)}setParams(e){this.params.ambientC=e.ambientC,this.params.gravity=e.gravity,this.params.swirl=e.swirl}clear(e,t){let n=this.gl;this.clearColor[0]=t,n.bindFramebuffer(n.FRAMEBUFFER,e.fbo),n.clearBufferfv(n.COLOR,0,this.clearColor)}reset(){let e=this.gl;this.clear(this.temp.a,this.params.ambientC),this.clear(this.temp.b,this.params.ambientC);for(let e of[this.vel.a,this.vel.b,this.pressure.a,this.pressure.b,this.div,this.curl])this.clear(e,0);e.bindFramebuffer(e.FRAMEBUFFER,null),this.time=0,this.avgStale=!0,this.readStale=!0}begin(e,t){let n=this.gl;n.bindFramebuffer(n.FRAMEBUFFER,t.fbo),n.useProgram(e.program);let r=e.u;return r.uSim&&n.uniform2i(r.uSim,this.simShape[0],this.simShape[1]),r.uQuality&&n.uniform1i(r.uQuality,this.quality),r.uPropsA&&this.bind(r.uPropsA,ur,this.propsA),r.uPropsB&&this.bind(r.uPropsB,dr,this.propsB),r}bind(e,t,n){if(!e)return;let r=this.gl;r.activeTexture(r.TEXTURE0+t),r.bindTexture(r.TEXTURE_2D,n),r.uniform1i(e,t)}f(e,t){e&&this.gl.uniform1f(e,t)}draw(){this.gl.drawArrays(this.gl.TRIANGLES,0,3)}step(e){let t=this.gl,n=this.passes,r=this.params.ambientC,i=this.quality;t.disable(t.BLEND),t.bindVertexArray(this.vao),t.viewport(0,0,this.simShape[0],this.simShape[1]);let a=this.begin(n.heatSource,this.temp.b);this.bind(a.uTemp,U,this.temp.a.tex),this.f(a.uDt,e),this.f(a.uPower,40),this.f(a.uAmbient,r),this.f(a.uTMin,Bn),this.f(a.uTMax,300),this.draw(),this.temp.swap(),a=this.begin(n.velSource,this.vel.b),this.bind(a.uVel,U,this.vel.a.tex),this.bind(a.uTemp,fr,this.temp.a.tex),this.f(a.uDt,e),this.f(a.uFanK,1-Math.exp(-20*e)),this.f(a.uGravity,+!!this.params.gravity),this.f(a.uBuoyancy,Rn),this.f(a.uAmbient,r),this.f(a.uSweepPhase,Ln(this.time)),this.f(a.uSweepHalf,In),this.draw(),this.vel.swap(),a=this.begin(n.advectTemp,this.temp.b),this.bind(a.uTemp,U,this.temp.a.tex),this.bind(a.uVel,fr,this.vel.a.tex),this.f(a.uDt,e),this.f(a.uAmbient,r),this.f(a.uTMin,Bn),this.f(a.uTMax,300),this.draw(),this.temp.swap(),a=this.begin(n.advectVel,this.vel.b),this.bind(a.uVel,U,this.vel.a.tex),this.f(a.uDt,e),this.draw(),this.vel.swap();let o=Hn(e,i);for(let t=0;t<o;t++)a=this.begin(n.diffuse,this.temp.b),this.bind(a.uTemp,U,this.temp.a.tex),this.f(a.uDt,e/o),this.f(a.uInvH2,i*i),this.f(a.uAmbient,r),this.f(a.uKOutside,2),this.f(a.uTMin,Bn),this.f(a.uTMax,300),this.draw(),this.temp.swap();this.params.swirl>0&&(a=this.begin(n.curl,this.curl),this.bind(a.uVel,U,this.vel.a.tex),this.draw(),a=this.begin(n.vorticity,this.vel.b),this.bind(a.uVel,U,this.vel.a.tex),this.bind(a.uCurl,fr,this.curl.tex),this.f(a.uDt,e),this.f(a.uEps,zn*this.params.swirl/i),this.draw(),this.vel.swap()),a=this.begin(n.divergence,this.div),this.bind(a.uVel,U,this.vel.a.tex),this.draw();for(let e=0;e<30;e++)a=this.begin(n.pressure,this.pressure.b),this.bind(a.uPressure,U,this.pressure.a.tex),this.bind(a.uDiv,fr,this.div.tex),this.f(a.uH2,1/(i*i)),this.draw(),this.pressure.swap();a=this.begin(n.project,this.vel.b),this.bind(a.uVel,U,this.vel.a.tex),this.bind(a.uPressure,fr,this.pressure.a.tex),this.f(a.uVMax,40),this.draw(),this.vel.swap(),t.bindFramebuffer(t.FRAMEBUFFER,null),this.time=(this.time+e)%20,this.avgStale=!0,this.readStale=!0}refreshAverages(){if(!this.avgStale)return;let e=this.gl;e.bindVertexArray(this.vao),e.viewport(0,0,this.tileShape[0],this.tileShape[1]);let t=this.begin(this.passes.tileAverage,this.avg);this.bind(t.uTemp,U,this.temp.a.tex),this.bind(t.uVel,fr,this.vel.a.tex),this.draw(),e.bindFramebuffer(e.FRAMEBUFFER,null),this.avgStale=!1}readField(e,t){if(this.readStale){let e=this.gl;this.refreshAverages(),e.bindFramebuffer(e.FRAMEBUFFER,this.avg.fbo),e.readPixels(0,0,this.tileShape[0],this.tileShape[1],e.RGBA,e.FLOAT,this.readBuf),e.bindFramebuffer(e.FRAMEBUFFER,null),this.readStale=!1}let n=this.readBuf.length/4;if(e===`temperature`)for(let e=0;e<n&&e<t.length;e++)t[e]=this.readBuf[e*4];else for(let e=0;e<n&&e*2+1<t.length;e++)t[e*2]=this.readBuf[e*4+1],t[e*2+1]=this.readBuf[e*4+2]}dispose(){let e=this.gl;this.fields&&this.freeFields(this.fields),this.fields=null,e.deleteTexture(this.propsA),e.deleteTexture(this.propsB),e.deleteVertexArray(this.vao);for(let t of Object.values(this.passes))e.deleteProgram(t.program)}},hr={ambientC:20,gravity:!1,simQuality:2,swirl:.3,overlays:{heatMap:!0,arrows:!0,particles:!0,streamlines:!1,gridLines:!0},heatScale:{auto:!1,minC:0,maxC:100}};function gr(e){return{...e,overlays:{...e.overlays},heatScale:{...e.heatScale}}}function _r(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function vr(e,t,n,r){return typeof e==`number`&&Number.isFinite(e)?Math.min(r,Math.max(n,e)):t}function yr(e,t){return typeof e==`boolean`?e:t}function br(e){let t=hr,n=_r(e)?e:{},r=_r(n.overlays)?n.overlays:{},i=_r(n.heatScale)?n.heatScale:{},a=n.simQuality,o={auto:yr(i.auto,t.heatScale.auto),minC:vr(i.minC,t.heatScale.minC,-50,200),maxC:vr(i.maxC,t.heatScale.maxC,-50,200)};return o.maxC<=o.minC&&(o.minC=t.heatScale.minC,o.maxC=t.heatScale.maxC),{ambientC:vr(n.ambientC,t.ambientC,-50,100),gravity:yr(n.gravity,t.gravity),simQuality:a===1||a===2||a===4?a:t.simQuality,swirl:vr(n.swirl,t.swirl,0,1),overlays:{heatMap:yr(r.heatMap,t.overlays.heatMap),arrows:yr(r.arrows,t.overlays.arrows),particles:yr(r.particles,t.overlays.particles),streamlines:yr(r.streamlines,t.overlays.streamlines),gridLines:yr(r.gridLines,t.overlays.gridLines)},heatScale:o}}var xr=class e{scene;changes;mergeKey;constructor(e,t,n){this.scene=e,this.changes=t,this.mergeKey=n}apply(){for(let[e,t]of this.changes)this.scene.layout.setTileSnapshot(e,t.after)}revert(){for(let[e,t]of this.changes)this.scene.layout.setTileSnapshot(e,t.before)}merge(t){if(t instanceof e)for(let[e,n]of t.changes){let t=this.changes.get(e);t?t.after=n.after:this.changes.set(e,n)}}},Sr=class e{scene;mergeKey;before;after;constructor(e,t,n,r){this.scene=e,this.mergeKey=r,this.before=gr(t),this.after=gr(n)}apply(){this.scene.settings=gr(this.after)}revert(){this.scene.settings=gr(this.before)}merge(t){t instanceof e&&(this.after=t.after)}},Cr=class{scene;before;after;constructor(e,t,n){this.scene=e,this.before=t,this.after=n}apply(){this.scene.restore(this.after)}revert(){this.scene.restore(this.before)}},wr=class{undoStack=[];redoStack=[];get canUndo(){return this.undoStack.length>0}get canRedo(){return this.redoStack.length>0}execute(e,t=Date.now()){e.apply(),this.record(e,t)}record(e,t=Date.now()){this.redoStack.length=0;let n=this.undoStack[this.undoStack.length-1];n&&e.mergeKey!==void 0&&n.cmd.mergeKey===e.mergeKey&&n.cmd.merge&&t-n.time<600?(n.cmd.merge(e),n.time=t):(this.undoStack.push({cmd:e,time:t}),this.undoStack.length>200&&this.undoStack.shift())}undo(){let e=this.undoStack.pop();return e?(e.cmd.revert(),this.redoStack.push(e),!0):!1}redo(){let e=this.redoStack.pop();return e?(e.cmd.apply(),this.undoStack.push(e),!0):!1}clear(){this.undoStack.length=0,this.redoStack.length=0}},W=class extends Error{name=`SaveFormatError`},Tr={1:e=>({...e,tiles:Array.isArray(e.tiles)?e.tiles.map(e=>typeof e==`object`&&e&&e.type===`heater`?{on:!0,...e}:e):e.tiles})};function Er(e,t=Tr,n=2){if(typeof e!=`object`||!e||Array.isArray(e))throw new W(`The file is not a saved layout.`);let r=e,i=r.version;if(typeof i!=`number`||!Number.isInteger(i)||i<1)throw new W(`The file has no valid version number.`);if(i>n)throw new W(`The file is from a newer version of the simulator (format ${i}, this one reads up to ${n}).`);for(;i<n;){let e=t[i];if(!e)throw new W(`No way to upgrade format ${i}.`);r={...e(r),version:i+1},i++}return r}function Dr(e){let{layout:t,settings:n}=e,r=new Map(t.fans),i=new Map(t.heaters),a=new Map(t.windows),o=[],s=[0,0,0];for(let e=0;e<t.types.length;e++){let n=t.types[e];if(n===H.Air)continue;_t(t.shape,e,s);let c=s[0],l=s[1];if(n===H.Wall)o.push({x:c,y:l,type:`wall`});else if(n===H.Fan){let{dir:t,...n}=r.get(e)??Et;o.push({x:c,y:l,type:`fan`,dir:bt[t],...n})}else n===H.Heater?o.push({x:c,y:l,type:`heater`,...i.get(e)??Dt}):n===H.Window&&o.push({x:c,y:l,type:`window`,...a.get(e)??Ot})}return{version:2,grid:{width:t.shape[0],height:t.shape[1]},settings:n,tiles:o}}function Or(e){return JSON.stringify(Dr(e),null,2)}function kr(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function Ar(e,t){if(typeof e!=`number`||!Number.isInteger(e)||e<1||e>100)throw new W(`Grid ${t} must be a whole number from 1 to 100.`);return e}function jr(e){let t;try{t=JSON.parse(e)}catch{throw new W(`This is not a valid JSON file.`)}return Mr(Er(t))}function Mr(e){if(!kr(e.grid))throw new W(`The file has no grid size.`);let t=[Ar(e.grid.width,`width`),Ar(e.grid.height,`height`)];if(!Array.isArray(e.tiles))throw new W(`The file has no tile list.`);let n=new Uint8Array(t[0]*t[1]),r=new Map,i=new Map,a=new Map;return e.tiles.forEach((e,o)=>{if(!kr(e))throw new W(`Tile ${o} is not an object.`);let{x:s,y:c}=e;if(typeof s!=`number`||typeof c!=`number`||!Number.isInteger(s)||!Number.isInteger(c)||s<0||c<0||s>=t[0]||c>=t[1])throw new W(`Tile ${o} is outside the grid.`);let l=V(t,s,c);switch(r.delete(l),i.delete(l),a.delete(l),e.type){case`wall`:n[l]=H.Wall;break;case`fan`:{n[l]=H.Fan;let t=bt.indexOf(String(e.dir));r.set(l,{...Et,...At({...t>=0?{dir:t}:{},...typeof e.on==`boolean`?{on:e.on}:{},...typeof e.level==`number`?{level:e.level}:{},...typeof e.oscillate==`boolean`?{oscillate:e.oscillate}:{},...typeof e.sweepSpeed==`number`?{sweepSpeed:e.sweepSpeed}:{}})});break}case`heater`:n[l]=H.Heater,i.set(l,{...Dt,...jt({...typeof e.on==`boolean`?{on:e.on}:{},...typeof e.targetC==`number`?{targetC:e.targetC}:{},...typeof e.outputRate==`number`?{outputRate:e.outputRate}:{}})});break;case`window`:n[l]=H.Window,a.set(l,{...Ot,...Mt(typeof e.open==`boolean`?{open:e.open}:{})});break;default:throw new W(`Tile ${o} has an unknown type "${String(e.type)}".`)}}),{layout:{shape:t,types:n,fans:[...r],heaters:[...i],windows:[...a]},settings:br(e.settings)}}var Nr=`airflow.autosave`;function Pr(e){if(!e)return null;try{let t=e.getItem(Nr);return t?jr(t):null}catch{return null}}var Fr=class{store;getText;delayMs;timer=null;constructor(e,t,n=500){this.store=e,this.getText=t,this.delayMs=n}schedule(){this.timer!==null&&clearTimeout(this.timer),this.timer=setTimeout(()=>this.flush(),this.delayMs)}flush(){if(this.timer!==null){clearTimeout(this.timer),this.timer=null;try{this.store?.setItem(Nr,this.getText())}catch{}}}},Ir=class{flags;list=[];all=!0;constructor(e){this.flags=new Uint8Array(e)}reset(e){this.flags=new Uint8Array(e),this.list.length=0,this.all=!0}get count(){return this.list.length}mark(e){this.flags[e]||(this.flags[e]=1,this.list.push(e))}markAll(){this.all=!0}consumeAll(){return this.all?(this.all=!1,this.flags.fill(0),this.list.length=0,!0):!1}drain(e){for(let t=0;t<this.list.length;t++){let n=this.list[t];this.flags[n]=0,e(n)}this.list.length=0}};function Lr(e,t){return JSON.stringify(e)===JSON.stringify(t)}var Rr=class{shape;types;fans=new Map;heaters=new Map;windows=new Map;lastUsed={fan:{...Et},heater:{...Dt},window:{...Ot}};trackers=[];constructor(e){this.shape=e;let t=gt(e);this.types=new Uint8Array(t)}typeAt(e){return this.types[e]}setTile(e,t){return this.types[e]!==t&&(this.fans.delete(e),this.heaters.delete(e),this.windows.delete(e),this.types[e]=t,t===H.Fan?this.fans.set(e,{...this.lastUsed.fan}):t===H.Heater?this.heaters.set(e,{...this.lastUsed.heater}):t===H.Window&&this.windows.set(e,{...this.lastUsed.window}),this.markDirty(e),!0)}updateFan(e,t){let n=this.fans.get(e);return n?(Object.assign(n,At(t)),Object.assign(this.lastUsed.fan,n),this.markDirty(e),!0):!1}updateHeater(e,t){let n=this.heaters.get(e);return n?(Object.assign(n,jt(t)),Object.assign(this.lastUsed.heater,n),this.markDirty(e),!0):!1}updateWindow(e,t){let n=this.windows.get(e);return n?(Object.assign(n,Mt(t)),Object.assign(this.lastUsed.window,n),this.markDirty(e),!0):!1}newTileSnapshot(e){let t={type:e};return e===H.Fan?t.fan={...this.lastUsed.fan}:e===H.Heater?t.heater={...this.lastUsed.heater}:e===H.Window&&(t.window={...this.lastUsed.window}),t}tileSnapshot(e){let t={type:this.typeAt(e)},n=this.fans.get(e),r=this.heaters.get(e),i=this.windows.get(e);return n&&(t.fan={...n}),r&&(t.heater={...r}),i&&(t.window={...i}),t}setTileSnapshot(e,t){this.fans.delete(e),this.heaters.delete(e),this.windows.delete(e),this.types[e]=t.type,t.fan&&this.fans.set(e,{...t.fan}),t.heater&&this.heaters.set(e,{...t.heater}),t.window&&this.windows.set(e,{...t.window}),this.markDirty(e)}snapshot(){let e=e=>Array.from(e,([e,t])=>[e,{...t}]);return{shape:[...this.shape],types:this.types.slice(),fans:e(this.fans),heaters:e(this.heaters),windows:e(this.windows)}}restore(e){this.shape=[...e.shape],this.types=e.types.slice(),this.fans.clear(),this.heaters.clear(),this.windows.clear();for(let[t,n]of e.fans)this.fans.set(t,{...n});for(let[t,n]of e.heaters)this.heaters.set(t,{...n});for(let[t,n]of e.windows)this.windows.set(t,{...n});for(let e of this.trackers)e.reset(this.types.length)}resize(e){if(yt(this.shape,e))return;let t=this.shape,n=this.types,r=new Map(this.fans),i=new Map(this.heaters),a=new Map(this.windows),o=gt(e);this.shape=e,this.types=new Uint8Array(o),this.fans.clear(),this.heaters.clear(),this.windows.clear();let s=[0,0,0];for(let o=0;o<n.length;o++){if(_t(t,o,s),s[0]>=e[0]||s[1]>=e[1]||s[2]>=(e[2]??1))continue;let c=V(e,s[0],s[1],s[2]);this.types[c]=n[o];let l=r.get(o);l&&this.fans.set(c,l);let u=i.get(o);u&&this.heaters.set(c,u);let d=a.get(o);d&&this.windows.set(c,d)}for(let e of this.trackers)e.reset(o)}track(){let e=new Ir(this.types.length);return this.trackers.push(e),e}markDirty(e){for(let t=0;t<this.trackers.length;t++)this.trackers[t].mark(e)}},zr=class{layout;settings;constructor(e,t){this.layout=e,this.settings=t}snapshot(){return{layout:this.layout.snapshot(),settings:gr(this.settings)}}restore(e){this.layout.restore(e.layout),this.settings=gr(e.settings)}},Br=(e,t,n)=>V([e.w,e.h],t,n);function Vr(e,t){let n=[0,0,0],r=1/0,i=1/0,a=-1/0,o=-1/0;for(let s of t)_t(e.shape,s,n),r=Math.min(r,n[0]),i=Math.min(i,n[1]),a=Math.max(a,n[0]),o=Math.max(o,n[1]);if(r>a)return null;let s={w:a-r+1,h:o-i+1,cells:[]};s.cells=Array(s.w*s.h).fill(null);for(let a of t)_t(e.shape,a,n),s.cells[Br(s,n[0]-r,n[1]-i)]=e.tileSnapshot(a);return{stamp:s,x:r,y:i}}function Hr(e,t,n,r,i){let a={w:t,h:n,cells:Array(t*n).fill(null)};for(let t=0;t<e.h;t++)for(let n=0;n<e.w;n++){let o=e.cells[Br(e,n,t)];if(!o)continue;let[s,c]=r(n,t);a.cells[Br(a,s,c)]=i(o)}return a}function Ur(e,t){return e.fan?{...e,fan:{...e.fan,dir:t(e.fan.dir)}}:e}function Wr(e,t){return Hr(e,e.h,e.w,(n,r)=>t?[e.h-1-r,n]:[r,e.w-1-n],e=>Ur(e,e=>Nt(e,t)))}function Gr(e,t,n,r,i){for(let a=0;a<t.h;a++)for(let o=0;o<t.w;o++){let s=t.cells[Br(t,o,a)];s&&vt(e,n+o,r+a)&&i(V(e,n+o,r+a),s)}}function Kr(e,t,n,r,i){let a=Math.max(0,Math.min(t,r)),o=Math.min(e[0]-1,Math.max(t,r)),s=Math.max(0,Math.min(n,i)),c=Math.min(e[1]-1,Math.max(n,i)),l=[];for(let t=s;t<=c;t++)for(let n=a;n<=o;n++)l.push(V(e,n,t));return l}function qr(){try{return window.localStorage}catch{return null}}var Jr=qr(),G=new zr(new Rr(ht),gr(hr)),Yr=Pr(Jr);Yr&&G.restore(Yr);var K=G.layout,Xr=new wr,Zr=new Fr(Jr,Ca),Qr=Ft(),$r={w:0,h:0},q=B(`pointer`),ei=B(H.Wall),ti=B(G.settings),ni=B(K.shape),J=B(null),Y=B(new Set),ri={kind:`none`,x0:0,y0:0,x1:0,y1:0,mode:`replace`},X={stamp:null,ox:0,oy:0,kind:`paste`,baseX:0,baseY:0},ii=null,ai=B(!1),oi=B(0),si=B(0),ci=B(null),li=B(!0),ui=[.25,.5,1,2,4],di=B(1),fi=B({lo:hr.heatScale.minC,hi:hr.heatScale.maxC}),pi={temp:new Float32Array(1e4),vel:new Float32Array(2e4),count:0},mi=B(0),hi=B(null),gi={steps:0,reset:!1};function _i(){li.value=!li.value,Z()}function vi(){li.peek()||(gi.steps++,Z())}function yi(){gi.reset=!0,Z()}var bi=[-1,-1];function xi(){return si.value,Xr.canUndo}function Si(){return si.value,Xr.canRedo}var Ci=!0;function Z(){Ci=!0}function wi(){let e=Ci;return Ci=!1,e}function Ti(){Lt(Qr,K.shape,$r.w,$r.h),Z()}function Ei(){oi.value++,si.value++,ti.value=G.settings,yt(ni.value,K.shape)||(ni.value=K.shape,Pi(),Qi(),Ti()),J.value!==null&&J.value>=K.types.length&&(J.value=null),Fi(),Z(),Zr.schedule()}typeof window<`u`&&(window.addEventListener(`pagehide`,()=>Zr.flush()),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`hidden`&&Zr.flush()}));var Di=null;function Oi(){ki(),Di=new Map}function ki(){if(!Di)return;let e=new Map;for(let[t,n]of Di){let r=K.tileSnapshot(t);Lr(n,r)||e.set(t,{before:n,after:r})}Di=null,e.size>0&&(Xr.record(new xr(G,e)),Ei())}function Ai(e,t,n){if(!vt(K.shape,e,t))return;let r=Di===null;r&&Oi();let i=V(K.shape,e,t);Di.has(i)||Di.set(i,K.tileSnapshot(i)),K.setTile(i,n)&&(oi.value++,Z(),Zr.schedule()),r&&ki()}function ji(e,t){J.value=vt(K.shape,e,t)?V(K.shape,e,t):null}var Mi=new Set;function Ni(e){Y.value=e.size===0?Mi:e,J.value=e.size===1?e.values().next().value:null,Z()}function Pi(){Y.peek().size>0&&(Y.value=Mi)}function Fi(){let e=Y.peek();for(let t of e)if(t>=K.types.length){Ni(new Set([...e].filter(e=>e<K.types.length)));return}}function Ii(){return Y.peek().size>0||J.peek()!==null}function Li(e,t){return vt(K.shape,e,t)&&Y.peek().has(V(K.shape,e,t))}function Ri(e,t,n,r,i){let a=Kr(K.shape,e,t,n,r),o=new Set(i===`replace`?[]:Y.peek());for(let e of a)i===`subtract`?o.delete(e):o.add(e);Ni(o)}function zi(e){ki();let t=new Map;for(let[n,r]of e){let e=K.tileSnapshot(n);Lr(e,r)||t.set(n,{before:e,after:r})}if(t.size===0)return;let n=new xr(G,t);n.apply(),Xr.record(n),Ei()}var Bi={type:H.Air};function Vi(){let e=new Map;for(let t of Y.peek())e.set(t,Bi);zi(e)}function Hi(){let e=Vr(K,Y.peek());return e?(ii=e.stamp,ai.value=!0,!0):!1}function Ui(){Hi()&&Vi()}function Wi(e,t,n){let r=new Map;for(let e of Y.peek())r.set(e,Bi);let i=new Set;Gr(K.shape,e,t,n,(e,t)=>{r.set(e,t),i.add(e)}),zi(r),Ni(i)}function Gi(e){let t=t=>Wr(t,e===`cw`);if(X.stamp&&X.kind===`paste`){X.stamp=t(X.stamp),ii=X.stamp,Xi(),Z();return}let n=Vr(K,Y.peek());if(!n)return;let r=t(n.stamp),[i,a]=K.shape;if(r.w>i||r.h>a){ci.value=`That selection doesn't fit the grid once rotated.`;return}let o=n.x+Math.floor((n.stamp.w-r.w)/2),s=n.y+Math.floor((n.stamp.h-r.h)/2);Wi(r,Math.min(i-r.w,Math.max(0,o)),Math.min(a-r.h,Math.max(0,s)))}function Ki(){let e=Vr(K,Y.peek());return e?(X.stamp=e.stamp,X.kind=`move`,X.baseX=X.ox=e.x,X.baseY=X.oy=e.y,!0):!1}function qi(e,t){let n=X.stamp;n&&X.kind===`move`&&(X.ox=Math.min(K.shape[0]-n.w,Math.max(0,X.baseX+e)),X.oy=Math.min(K.shape[1]-n.h,Math.max(0,X.baseY+t)),Z())}function Ji(e){let t=X.stamp;t&&X.kind===`move`&&e&&(X.ox!==X.baseX||X.oy!==X.baseY)&&Wi(t,X.ox,X.oy),X.stamp=null,Z()}function Yi(){return X.stamp!==null&&X.kind===`paste`}function Xi(){let e=X.stamp;if(!e||X.kind!==`paste`)return;let t=bi[0]<0?0:bi[0],n=bi[1]<0?0:bi[1];X.ox=Math.max(0,Math.min(K.shape[0]-e.w,t-Math.floor(e.w/2))),X.oy=Math.max(0,Math.min(K.shape[1]-e.h,n-Math.floor(e.h/2)))}function Zi(){ii&&(Ji(!1),X.stamp=ii,X.kind=`paste`,q.value=`select`,Xi(),Z())}function Qi(){Yi()&&(X.stamp=null,Z())}function $i(){let e=X.stamp;if(!e||X.kind!==`paste`)return;Xi();let t=new Map,n=new Set;Gr(K.shape,e,X.ox,X.oy,(e,r)=>{t.set(e,r),n.add(e)}),X.stamp=null,zi(t),Ni(n)}function ea(){let e=Y.peek();if(e.size>1)return[...e];let t=hi.peek();if(t!==null&&K.typeAt(t)!==H.Air&&K.typeAt(t)!==H.Wall)return[t];let n=J.peek();return n===null?[]:[n]}function ta(e,t){return e.filter(e=>K.typeAt(e)===t)}function na(){return ea().some(e=>{let t=K.typeAt(e);return t===H.Fan||t===H.Heater||t===H.Window})}function ra(e){sa(ta(ea(),H.Fan),[`dir`],t=>K.updateFan(t,{dir:(K.fans.get(t).dir+e+8)%8}))}function ia(e,t){let n=ea(),r=ta(n,H.Fan),i=ta(n,H.Heater),a=e?`secondary`:`primary`;sa(r,[a],n=>{let r=K.fans.get(n);return K.updateFan(n,e?{sweepSpeed:r.sweepSpeed+t}:{level:r.level+t})}),sa(i,[a],n=>{let r=K.heaters.get(n);return K.updateHeater(n,e?{outputRate:r.outputRate+t}:{targetC:r.targetC+5*t})})}function aa(){let e=ea(),t=ta(e,H.Fan),n=ta(e,H.Window),r=ta(e,H.Heater),i=!t.every(e=>K.fans.get(e).oscillate),a=!n.every(e=>K.windows.get(e).open);ca(t,{oscillate:i}),ua(n,{open:a}),la(r,{on:!r.every(e=>K.heaters.get(e).on)})}function oa(e){Yi()||q.peek()===`select`&&Y.peek().size>0?Gi(e?`cw`:`ccw`):ra(e?1:-1)}function sa(e,t,n){if(e.length===0)return;ki();let r=new Map;for(let t of e){let e=K.tileSnapshot(t);if(!n(t))continue;let i=K.tileSnapshot(t);Lr(e,i)||r.set(t,{before:e,after:i})}r.size!==0&&(Xr.record(new xr(G,r,`tiles:${e[0]}:${e.length}:${t.join(`,`)}`)),Ei())}function ca(e,t){sa(e,Object.keys(t),e=>K.updateFan(e,t))}function la(e,t){sa(e,Object.keys(t),e=>K.updateHeater(e,t))}function ua(e,t){sa(e,Object.keys(t),e=>K.updateWindow(e,t))}function da(e,t){ki();let n=G.settings,r=br(t);JSON.stringify(n)!==JSON.stringify(r)&&(Xr.execute(new Sr(G,n,r,`settings:${e}`)),Ei())}function fa(e,t){let n=G.settings;da(`overlay:${e}`,{...n,overlays:{...n.overlays,[e]:t}})}function pa(e){fa(`gridLines`,e)}function ma(e){da(`gravity`,{...G.settings,gravity:e})}function ha(e){da(`swirl`,{...G.settings,swirl:e})}function ga(e){da(`simQuality`,{...G.settings,simQuality:e})}function _a(e){let t=G.settings;da(`heatScale.auto`,{...t,heatScale:{...t.heatScale,auto:e}})}function va(e){ki();let t=new Cr(G,G.snapshot(),e);Xr.execute(t),J.value=null,Pi(),Ei()}function ya(){if(K.types.every(e=>e===H.Air))return;let e=G.snapshot();va({layout:{shape:e.layout.shape,types:new Uint8Array(K.types.length),fans:[],heaters:[],windows:[]},settings:e.settings})}function ba(e,t){let n=e=>Math.min(100,Math.max(1,Math.round(e)||1)),r=[n(e),n(t)];if(yt(K.shape,r))return;ki();let i=G.snapshot();K.resize(r);let a=G.snapshot();Xr.record(new Cr(G,i,a)),J.value=null,Pi(),Ei()}function xa(){ki(),Xr.undo()&&Ei()}function Sa(){ki(),Xr.redo()&&Ei()}function Ca(){return Or(G.snapshot())}function wa(e){try{return va(jr(e)),yi(),Ti(),ci.value=null,!0}catch(e){if(e instanceof W)return ci.value=`Could not import: ${e.message}`,!1;throw e}}function Ta(e){if(e>=pi.count)return null;let t=pi.vel[e*2],n=pi.vel[e*2+1];return{tempC:pi.temp[e],u:t,v:n,speed:Math.hypot(t,n)}}function Ea(e,t){let n=Math.atan2(e,-t);return bt[(Math.round(n/(Math.PI/4))%8+8)%8]}function Da(e){return`${e.toFixed(1)} °C`}function Oa(e){return e.speed<.05?`Still`:`${e.speed.toFixed(1)} tiles/s ${Ea(e.u,e.v)}`}var Q=e=>e.preventDefault(),ka=Symbol.for(`pv`),Aa=0;Array.isArray;function $(t,n,r,i,a,o){n||={};var s,c,l=n;if(`ref`in l&&typeof t!=`function`)for(c in l={},n)c==`ref`?s=n[c]:l[c]=n[c];var u={type:t,props:l,key:r,ref:s,__k:null,__:null,__b:0,__e:null,__c:null,constructor:ka,__v:--Aa,__i:-1,__u:0};return(a||o)&&(u.__source=a,u.__self=o),e.vnode&&e.vnode(u),u}var ja=[1,2,4];function Ma(e){return $(`label`,{class:`toggle-row${e.indent?` indent`:``}`,title:e.title,children:[$(`span`,{children:e.label}),$(`input`,{type:`checkbox`,class:`switch`,role:`switch`,checked:e.checked,disabled:e.disabled,onChange:t=>{e.onChange(t.currentTarget.checked),t.currentTarget.blur()}})]})}function Na({name:e,label:t,title:n,indent:r}){return $(Ma,{label:t,title:n,indent:r,checked:ti.value.overlays[e],onChange:t=>fa(e,t)})}function Pa(){let e=ti.value;return $(`div`,{class:`sim-settings`,children:[$(`section`,{class:`controls`,children:[$(`div`,{class:`section-head`,children:$(`h2`,{children:`Display`})}),$(Na,{name:`heatMap`,label:`Heat map`}),$(Ma,{label:`Auto scale`,indent:!0,checked:e.heatScale.auto,disabled:!e.overlays.heatMap,onChange:_a}),$(Na,{name:`arrows`,label:`Arrows`,title:`One arrow per tile: air speed and direction`}),$(Na,{name:`particles`,label:`Particles`,title:`Dots that drift with the air`}),$(Na,{name:`streamlines`,label:`Streamlines`,title:`Curves that follow the air`})]}),$(`section`,{class:`controls`,children:[$(`div`,{class:`section-head`,children:$(`h2`,{children:`Simulation`})}),$(`div`,{class:`field stack-row`,role:`radiogroup`,"aria-label":`Sim quality`,title:`Sim cells per tile edge. Higher looks smoother and costs more.`,children:[$(`span`,{children:`Quality`}),$(`div`,{class:`group`,children:ja.map(t=>$(`button`,{class:e.simQuality===t?`active`:``,role:`radio`,"aria-checked":e.simQuality===t,onMouseDown:Q,onClick:()=>ga(t),children:[t,`×`]},t))})]}),$(Ma,{label:`Gravity`,title:`Side view: warm air rises, cool air sinks`,checked:e.gravity,onChange:ma}),$(`label`,{class:`field stacked`,title:`Vorticity confinement: keeps small swirls alive`,children:[$(`span`,{children:`Swirl`}),$(`input`,{type:`range`,min:0,max:1,step:.05,value:e.swirl,onInput:e=>ha(Number(e.currentTarget.value)),onPointerUp:e=>e.currentTarget.blur()}),$(`output`,{children:e.swirl.toFixed(2)})]})]})]})}var Fa=[`Air`,`Wall`,`Fan`,`Heater`,`Window`];function Ia({i:e}){mi.value;let[t,n]=_t(K.shape,e,[0,0,0]),r=K.typeAt(e),i=Ta(e),a=ti.value.ambientC,o=r===H.Heater?K.heaters.get(e):void 0,s=i===null?null:i.tempC-a;return $(`section`,{class:`stats`,children:[$(`h2`,{children:[`Tile `,t,`, `,n]}),$(`dl`,{children:[$(`dt`,{children:`Type`}),$(`dd`,{children:Fa[r]}),$(`dt`,{children:`Temperature`}),$(`dd`,{children:i===null?`—`:Da(i.tempC)}),$(`dt`,{children:`vs outside`}),$(`dd`,{children:s===null?`—`:`${s>=0?`+`:`−`}${Math.abs(s).toFixed(1)} °C`}),$(`dt`,{children:`Airflow`}),$(`dd`,{children:i===null?`—`:Oa(i)}),o&&$(x,{children:[$(`dt`,{children:`Status`}),$(`dd`,{children:i===null?`—`:o.on?i.tempC<o.targetC-.5?`Heating`:`At target`:`Off`})]})]})]})}var La=[`N`,`NE`,`E`,`SE`,`S`,`SW`,`W`,`NW`];function Ra(e){let t=e.format??String;return $(`label`,{class:`field stacked`,children:[$(`span`,{children:e.label}),$(`input`,{type:`range`,min:e.range[0],max:e.range[1],step:1,value:e.value,disabled:e.disabled,onInput:t=>e.onChange(Number(t.currentTarget.value)),onPointerUp:e=>e.currentTarget.blur()}),$(`output`,{children:e.mixed?`—`:t(e.value)})]})}function za(e){return e.every(t=>t===e[0])?e[0]:null}var Ba=10;function Va({dir:e,onChange:t}){let n=n=>{let r=n.currentTarget.getBoundingClientRect(),i=n.clientX-(r.left+r.width/2),a=n.clientY-(r.top+r.height/2);if(Math.hypot(i,a)<Ba)return;let o=(Math.round(Math.atan2(i,-a)*4/Math.PI)%8+8)%8;o!==e&&t(o)},r=n=>t(((e??0)+n+8)%8);return $(`button`,{class:`dial`,"aria-label":`Direction: ${e===null?`mixed`:La[e]}. Hold and drag to change.`,title:`Hold and drag toward a direction`,onPointerDown:e=>{e.currentTarget.setPointerCapture(e.pointerId),n(e)},onPointerMove:e=>{e.currentTarget.hasPointerCapture(e.pointerId)&&n(e)},onPointerUp:e=>{e.currentTarget.releasePointerCapture(e.pointerId),e.currentTarget.blur()},onKeyDown:e=>{let t=e.key===`ArrowRight`||e.key===`ArrowUp`?1:e.key===`ArrowLeft`||e.key===`ArrowDown`?-1:0;t!==0&&(e.preventDefault(),e.stopPropagation(),r(t))},children:$(`svg`,{viewBox:`-20 -20 40 40`,width:`56`,height:`56`,"aria-hidden":`true`,children:[La.map((e,t)=>$(`line`,{x1:`0`,y1:`-16`,x2:`0`,y2:t%2==0?`-12.5`:`-14`,transform:`rotate(${t*45})`,stroke:`currentColor`,"stroke-width":`1.5`,opacity:`0.5`},t)),e!==null&&$(`path`,{d:`M-3 9 V-1 H-7 L0 -10 L7 -1 H3 V9 Z`,transform:`rotate(${e*45})`,fill:`currentColor`}),e===null&&$(`text`,{y:`4`,"text-anchor":`middle`,"font-size":`12`,fill:`currentColor`,children:`—`})]})})}function Ha(e){let{value:t}=e;return $(`div`,{class:`section-head`,children:[$(`h2`,{children:e.title}),$(`label`,{class:`head-switch`,title:e.switchLabel,children:[$(`span`,{children:t===null?`—`:t?e.onText??`On`:e.offText??`Off`}),$(`input`,{type:`checkbox`,class:`switch`,role:`switch`,"aria-label":e.switchLabel,checked:t===!0,indeterminate:t===null,onChange:t=>e.onChange(t.currentTarget.checked)})]})]})}function Ua({ids:e}){let t=e.map(e=>K.fans.get(e)),n=za(t.map(e=>e.dir)),r=za(t.map(e=>e.on)),i=za(t.map(e=>e.level)),a=za(t.map(e=>e.oscillate)),o=za(t.map(e=>e.sweepSpeed));return $(`section`,{class:`controls`,children:[$(Ha,{title:e.length>1?`Fans (${e.length})`:`Fan`,switchLabel:`Power`,value:r,onChange:t=>ca(e,{on:t})}),$(`div`,{class:`aim`,children:[$(`div`,{class:`stack-label`,children:[$(`span`,{children:`Direction`}),$(Va,{dir:n,onChange:t=>ca(e,{dir:t})})]}),$(Ra,{label:`Level`,range:St,value:i??t[0].level,mixed:i===null,disabled:r===!1,onChange:t=>ca(e,{level:t})})]}),$(`div`,{class:`subgroup`,children:[$(`label`,{class:`field`,children:[$(`span`,{children:`Oscillate`}),$(`input`,{type:`checkbox`,class:`switch`,role:`switch`,checked:a===!0,indeterminate:a===null,onChange:t=>ca(e,{oscillate:t.currentTarget.checked})}),$(`output`,{children:a===null?`—`:a?`On`:`Off`})]}),$(Ra,{label:`Sweep speed`,range:Ct,value:o??t[0].sweepSpeed,mixed:o===null,disabled:a===!1,onChange:t=>ca(e,{sweepSpeed:t})})]})]})}function Wa({ids:e}){let t=e.map(e=>K.heaters.get(e)),n=za(t.map(e=>e.targetC)),r=za(t.map(e=>e.outputRate)),i=za(t.map(e=>e.on));return $(`section`,{class:`controls`,children:[$(Ha,{title:e.length>1?`Heaters (${e.length})`:`Heater`,switchLabel:`Power`,value:i,onChange:t=>la(e,{on:t})}),$(Ra,{label:`Target`,range:wt,value:n??t[0].targetC,mixed:n===null,disabled:i===!1,format:e=>`${e} °C`,onChange:t=>la(e,{targetC:t})}),$(Ra,{label:`Output rate`,range:Tt,value:r??t[0].outputRate,mixed:r===null,disabled:i===!1,onChange:t=>la(e,{outputRate:t})})]})}function Ga({ids:e}){let t=za(e.map(e=>K.windows.get(e).open));return $(`section`,{class:`controls`,children:[$(Ha,{title:e.length>1?`Windows (${e.length})`:`Window`,switchLabel:`Open`,onText:`Open`,offText:`Closed`,value:t,onChange:t=>ua(e,{open:t})}),$(`p`,{class:`hint`,children:t===null?`Mixed.`:t?`Open: air and heat pass through.`:`Closed: blocks air, leaks heat faster than a wall.`})]})}function Ka(){oi.value;let e=Y.value,t=J.value;if(e.size>1){let t=[...e],n=e=>t.filter(t=>K.typeAt(t)===e),r=n(H.Fan),i=n(H.Heater),a=n(H.Window);return $(`div`,{class:`selection`,children:[$(`p`,{class:`count`,children:[e.size,` tiles selected`]}),r.length>0&&$(Ua,{ids:r}),i.length>0&&$(Wa,{ids:i}),a.length>0&&$(Ga,{ids:a}),r.length+i.length+a.length===0&&$(`p`,{class:`hint`,children:`No fans, heaters, or windows in this selection.`})]})}let n=t===null?H.Air:K.typeAt(t),r=null;return t!==null&&n===H.Fan?r=$(Ua,{ids:[t]}):t!==null&&n===H.Heater?r=$(Wa,{ids:[t]}):t!==null&&n===H.Window?r=$(Ga,{ids:[t]}):t===null&&(r=$(`p`,{class:`hint`,children:`Click any tile with the pointer (Esc) to see its stats. Fans, heaters, and windows also show their settings. Use Select (S) to pick several tiles and edit them together.`})),$(`div`,{class:`selection`,children:[t!==null&&$(Ia,{i:t}),r]})}function qa(){return $(`aside`,{class:`panel`,children:[$(Ka,{}),$(Pa,{})]})}function Ja(e){switch(K.typeAt(e)){case H.Fan:{let t=K.fans.get(e);if(!t)return null;let n=[bt[t.dir],t.on?`level ${t.level}`:`off`];return t.oscillate&&n.push(`oscillating, sweep ${t.sweepSpeed}`),n.join(` · `)}case H.Heater:{let t=K.heaters.get(e);return t?`target ${t.targetC} °C · output ${t.outputRate}`:null}case H.Window:return K.windows.get(e)?.open?`open`:`closed`;default:return null}}function Ya(){let e=hi.value;if(mi.value,oi.value,e===null||e>=K.types.length)return null;let[t,n]=_t(K.shape,e,[0,0,0]),r=Ta(e),i=Ja(e);return $(`div`,{class:`inspector`,"aria-live":`off`,children:[$(`div`,{class:`inspector-head`,children:[t,`, `,n,` · `,Fa[K.typeAt(e)]]}),$(`div`,{children:r?Da(r.tempC):`—`}),$(`div`,{children:r?Oa(r):`—`}),i&&$(`div`,{class:`inspector-extra`,children:i})]})}var Xa=`rgb(51, 102, 230)`,Za=`rgb(230, 38, 26)`;function Qa(e,t){return`${t?e.toFixed(1):Math.round(e)} °C`}function $a({lo:e,hi:t,ambient:n,auto:r}){let i=Math.max(t-e,.001),a=Math.min(100,Math.max(0,(n-e)/i*100));return $(`div`,{class:`legend`,"aria-label":`Heat scale ${Qa(e,r)} to ${Qa(t,r)}`,children:[$(`div`,{class:`legend-bar`,style:{background:`linear-gradient(to right, ${Xa} 0%, #fff ${a}%, ${Za} 100%)`}}),$(`div`,{class:`legend-labels`,children:[$(`span`,{children:Qa(e,r)}),a>18&&a<82&&$(`span`,{class:`legend-ambient`,style:{left:`${a}%`},children:Qa(n,!1)}),$(`span`,{children:Qa(t,r)})]})]})}function eo(){let e=ti.value,t=fi.value;return e.overlays.heatMap?$(`div`,{class:`legend-float`,children:$($a,{lo:t.lo,hi:t.hi,ambient:e.ambientC,auto:e.heatScale.auto})}):null}var to=[{id:`heated-room`,name:`Heated room`,json:`{
  "version": 1,
  "grid": {
    "width": 24,
    "height": 16
  },
  "settings": {
    "ambientC": 20,
    "gravity": false,
    "simQuality": 2,
    "swirl": 0.3,
    "overlays": {
      "heatMap": true,
      "arrows": true,
      "particles": true,
      "streamlines": false,
      "gridLines": true
    },
    "heatScale": {
      "auto": false,
      "minC": 0,
      "maxC": 100
    }
  },
  "tiles": [
    {
      "x": 3,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 4,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 5,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 6,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 7,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 8,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 9,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 10,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 11,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 12,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 13,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 14,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 15,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 16,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 17,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 18,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 19,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 4,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 4,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 5,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 5,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 6,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 6,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 7,
      "type": "window",
      "open": false
    },
    {
      "x": 20,
      "y": 7,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 8,
      "type": "window",
      "open": false
    },
    {
      "x": 20,
      "y": 8,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 9,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 9,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 11,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 11,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 12,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 12,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 4,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 5,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 6,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 7,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 8,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 9,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 10,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 11,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 12,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 13,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 14,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 15,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 16,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 17,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 18,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 19,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 16,
      "y": 10,
      "type": "heater",
      "targetC": 50,
      "outputRate": 3
    }
  ]
}
`},{id:`fan-tunnel`,name:`Fan tunnel`,json:`{
  "version": 1,
  "grid": {
    "width": 32,
    "height": 14
  },
  "settings": {
    "ambientC": 20,
    "gravity": false,
    "simQuality": 2,
    "swirl": 0.3,
    "overlays": {
      "heatMap": true,
      "arrows": true,
      "particles": true,
      "streamlines": false,
      "gridLines": true
    },
    "heatScale": {
      "auto": false,
      "minC": 0,
      "maxC": 100
    }
  },
  "tiles": [
    {
      "x": 0,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 1,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 4,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 5,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 6,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 7,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 8,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 9,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 10,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 11,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 12,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 13,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 14,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 15,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 16,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 17,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 18,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 19,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 22,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 23,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 24,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 25,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 26,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 27,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 28,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 29,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 30,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 31,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 4,
      "y": 4,
      "type": "fan",
      "dir": "E",
      "on": true,
      "level": 4,
      "oscillate": false,
      "sweepSpeed": 2
    },
    {
      "x": 18,
      "y": 4,
      "type": "wall"
    },
    {
      "x": 4,
      "y": 5,
      "type": "fan",
      "dir": "E",
      "on": true,
      "level": 4,
      "oscillate": false,
      "sweepSpeed": 2
    },
    {
      "x": 18,
      "y": 5,
      "type": "wall"
    },
    {
      "x": 4,
      "y": 6,
      "type": "fan",
      "dir": "E",
      "on": true,
      "level": 4,
      "oscillate": false,
      "sweepSpeed": 2
    },
    {
      "x": 4,
      "y": 7,
      "type": "fan",
      "dir": "E",
      "on": true,
      "level": 4,
      "oscillate": false,
      "sweepSpeed": 2
    },
    {
      "x": 4,
      "y": 8,
      "type": "fan",
      "dir": "E",
      "on": true,
      "level": 4,
      "oscillate": false,
      "sweepSpeed": 2
    },
    {
      "x": 18,
      "y": 8,
      "type": "wall"
    },
    {
      "x": 4,
      "y": 9,
      "type": "fan",
      "dir": "E",
      "on": true,
      "level": 4,
      "oscillate": false,
      "sweepSpeed": 2
    },
    {
      "x": 18,
      "y": 9,
      "type": "wall"
    },
    {
      "x": 0,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 1,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 4,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 5,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 6,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 7,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 8,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 9,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 10,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 11,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 12,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 13,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 14,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 15,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 16,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 17,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 18,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 19,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 22,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 23,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 24,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 25,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 26,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 27,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 28,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 29,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 30,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 31,
      "y": 10,
      "type": "wall"
    }
  ]
}
`},{id:`radiator-plume`,name:`Radiator plume`,json:`{
  "version": 1,
  "grid": {
    "width": 24,
    "height": 20
  },
  "settings": {
    "ambientC": 20,
    "gravity": true,
    "simQuality": 2,
    "swirl": 0.3,
    "overlays": {
      "heatMap": true,
      "arrows": true,
      "particles": true,
      "streamlines": false,
      "gridLines": true
    },
    "heatScale": {
      "auto": false,
      "minC": 0,
      "maxC": 100
    }
  },
  "tiles": [
    {
      "x": 2,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 4,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 5,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 6,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 7,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 8,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 9,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 10,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 11,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 12,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 13,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 14,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 15,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 16,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 17,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 18,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 19,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 2,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 3,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 4,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 4,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 5,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 5,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 6,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 6,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 7,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 7,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 8,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 8,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 9,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 9,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 10,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 11,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 11,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 12,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 12,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 13,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 14,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 14,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 15,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 15,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 16,
      "type": "wall"
    },
    {
      "x": 10,
      "y": 16,
      "type": "heater",
      "targetC": 70,
      "outputRate": 4
    },
    {
      "x": 11,
      "y": 16,
      "type": "heater",
      "targetC": 70,
      "outputRate": 4
    },
    {
      "x": 12,
      "y": 16,
      "type": "heater",
      "targetC": 70,
      "outputRate": 4
    },
    {
      "x": 13,
      "y": 16,
      "type": "heater",
      "targetC": 70,
      "outputRate": 4
    },
    {
      "x": 21,
      "y": 16,
      "type": "wall"
    },
    {
      "x": 2,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 3,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 4,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 5,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 6,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 7,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 8,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 9,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 10,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 11,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 12,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 13,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 14,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 15,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 16,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 17,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 18,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 19,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 20,
      "y": 17,
      "type": "wall"
    },
    {
      "x": 21,
      "y": 17,
      "type": "wall"
    }
  ]
}
`},{id:`oscillating-fan`,name:`Oscillating fan`,json:`{
  "version": 1,
  "grid": {
    "width": 28,
    "height": 20
  },
  "settings": {
    "ambientC": 20,
    "gravity": false,
    "simQuality": 2,
    "swirl": 0.3,
    "overlays": {
      "heatMap": true,
      "arrows": true,
      "particles": true,
      "streamlines": false,
      "gridLines": true
    },
    "heatScale": {
      "auto": false,
      "minC": 0,
      "maxC": 100
    }
  },
  "tiles": [
    {
      "x": 7,
      "y": 10,
      "type": "fan",
      "dir": "E",
      "on": true,
      "level": 4,
      "oscillate": true,
      "sweepSpeed": 2
    },
    {
      "x": 9,
      "y": 10,
      "type": "heater",
      "targetC": 80,
      "outputRate": 5
    }
  ]
}
`}],no={viewBox:`0 0 24 24`,width:18,height:18,"aria-hidden":!0},ro=()=>$(`svg`,{...no,children:$(`path`,{d:`M7 4 L20 12 L7 20 Z`,fill:`currentColor`})}),io=()=>$(`svg`,{...no,children:$(`path`,{d:`M6 4h4v16H6zM14 4h4v16h-4z`,fill:`currentColor`})}),ao=()=>$(`svg`,{...no,children:$(`path`,{d:`M5 4 L16 12 L5 20 Z M18 4h3v16h-3z`,fill:`currentColor`})}),oo=()=>$(`svg`,{...no,children:$(`path`,{d:`M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z`,fill:`currentColor`})});function so(){let[e,t]=xe(!1);return $(`div`,{class:`speed`,onMouseEnter:()=>t(!0),onMouseLeave:()=>t(!1),children:[$(`button`,{title:`Sim speed`,"aria-haspopup":`true`,"aria-expanded":e,onMouseDown:Q,onClick:()=>t(!e),children:[di.value,`×`]}),e&&$(`div`,{class:`speed-options group`,role:`radiogroup`,"aria-label":`Sim speed`,children:ui.map(e=>$(`button`,{class:di.value===e?`active`:``,role:`radio`,"aria-checked":di.value===e,onMouseDown:Q,onClick:()=>{di.value=e,t(!1)},children:[e,`×`]},e))})]})}function co(){let e=li.value;return $(x,{children:[$(so,{}),$(`div`,{class:`group`,children:[$(`button`,{class:e?`active`:``,title:e?`Pause (tap Space)`:`Play (tap Space)`,"aria-label":e?`Pause`:`Play`,onMouseDown:Q,onClick:_i,children:$(e?io:ro,{})}),$(`button`,{title:`Step one frame (.)`,"aria-label":`Step one frame`,disabled:e,onMouseDown:Q,onClick:vi,children:$(ao,{})}),$(`button`,{title:`Reset simulation: air and heat back to ambient. Keeps the layout.`,"aria-label":`Reset simulation`,onMouseDown:Q,onClick:yi,children:$(oo,{})})]})]})}function lo(e,t){let n=URL.createObjectURL(new Blob([t],{type:`application/json`})),r=document.createElement(`a`);r.href=n,r.download=e,document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e3)}var uo=[{type:H.Air,key:`1`,label:`Air`},{type:H.Wall,key:`2`,label:`Wall`},{type:H.Fan,key:`3`,label:`Fan`},{type:H.Heater,key:`4`,label:`Heater`},{type:H.Window,key:`5`,label:`Window`}];function fo({axis:e}){let t=ni.value;return $(`input`,{type:`number`,min:1,max:100,value:t[e],"aria-label":e===0?`Grid width`:`Grid height`,onChange:t=>{let n=t.currentTarget,r=Number(n.value),[i,a]=ni.value;e===0?ba(r,a):ba(i,r),n.value=String(ni.value[e])}})}function po({redo:e}){return $(`svg`,{viewBox:`0 0 24 24`,width:`18`,height:`18`,"aria-hidden":`true`,style:e?{transform:`scaleX(-1)`}:void 0,children:$(`path`,{d:`M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z`,fill:`currentColor`})})}function mo({label:e,children:t}){let[n,r]=xe(!1),i=we(null);return Ce(()=>{if(!n)return;let e=e=>{i.current?.contains(e.target)||r(!1)},t=e=>{e.key===`Escape`&&r(!1)};return window.addEventListener(`pointerdown`,e),window.addEventListener(`keydown`,t),()=>{window.removeEventListener(`pointerdown`,e),window.removeEventListener(`keydown`,t)}},[n]),$(`div`,{class:`menu`,ref:i,children:[$(`button`,{class:n?`active`:``,"aria-haspopup":`menu`,"aria-expanded":n,onMouseDown:Q,onClick:()=>r(!n),children:[e,` ▾`]}),n&&$(`div`,{class:`menu-list`,role:`menu`,children:t(()=>r(!1))})]})}function ho(){let e=we(null);return $(x,{children:[$(mo,{label:`File`,children:t=>$(x,{children:[$(`button`,{role:`menuitem`,title:`Load a layout from a JSON file`,onMouseDown:Q,onClick:()=>{t(),e.current?.click()},children:`Import…`}),$(`button`,{role:`menuitem`,title:`Download the layout as a JSON file`,onMouseDown:Q,onClick:()=>{t(),lo(`airflow-layout.json`,Ca())},children:`Export`}),$(`div`,{class:`menu-heading`,children:`Examples`}),to.map(e=>$(`button`,{role:`menuitem`,onMouseDown:Q,onClick:()=>{t(),wa(e.json)},children:e.name},e.id))]})}),$(`input`,{ref:e,type:`file`,accept:`application/json,.json`,hidden:!0,onChange:async e=>{let t=e.currentTarget,n=t.files?.[0];if(t.value=``,n)try{wa(await n.text())}catch{ci.value=`Could not read that file.`}}})]})}function go(){return $(mo,{label:`Grid`,children:e=>$(x,{children:[$(`div`,{class:`menu-row`,children:[$(`span`,{children:`Size`}),$(`span`,{class:`menu-dims`,children:[$(fo,{axis:0}),` × `,$(fo,{axis:1})]})]}),$(`label`,{class:`menu-row`,children:[$(`span`,{children:`Grid lines`}),$(`input`,{type:`checkbox`,checked:ti.value.overlays.gridLines,onChange:e=>{pa(e.currentTarget.checked),e.currentTarget.blur()}})]}),$(`button`,{role:`menuitem`,title:`Fit to view (0 / Home)`,onMouseDown:Q,onClick:()=>{e(),Ti()},children:`Fit to view`}),$(`button`,{role:`menuitem`,class:`danger`,title:`Clear every tile back to air (can be undone)`,onMouseDown:Q,onClick:()=>{e(),ya()},children:`Clear grid`})]})})}function _o(){return $(`div`,{class:`toolbar`,children:[$(ho,{}),$(go,{}),$(`div`,{class:`group`,children:[$(`button`,{title:`Undo (Ctrl+Z)`,"aria-label":`Undo`,disabled:!xi(),onMouseDown:Q,onClick:xa,children:$(po,{})}),$(`button`,{title:`Redo (Ctrl+Shift+Z / Ctrl+Y)`,"aria-label":`Redo`,disabled:!Si(),onMouseDown:Q,onClick:Sa,children:$(po,{redo:!0})})]}),$(`div`,{class:`group`,children:$(`button`,{class:q.value===`select`?`active`:``,title:`Select: drag a box. Shift adds, Alt or Ctrl subtracts (S)`,onMouseDown:Q,onClick:()=>q.value=q.peek()===`select`?`pointer`:`select`,children:[$(`kbd`,{children:`S`}),` Select`]})}),$(`div`,{class:`group`,role:`radiogroup`,"aria-label":`Tile type`,children:uo.map(e=>$(`button`,{class:q.value!==`pointer`&&ei.value===e.type?`active`:``,title:`Brush: ${e.label} (${e.key})`,onMouseDown:Q,onClick:()=>{ei.value=e.type,q.peek()===`pointer`&&(q.value=`brush`)},children:[$(`kbd`,{children:e.key}),` `,e.label]},e.type))}),$(`div`,{class:`toolbar-end`,children:$(co,{})})]})}function vo(){let e=we(null),t=we(null),[n,r]=xe(null);return Ce(()=>{let n=e.current,i=t.current;if(!n||!i)return;let a=qt(n);if(!a.ok){r(a.reason);return}let{gl:o}=a,s=new qn(o),c=new An(i),l={view:Qr,dpr:1,shape:K.shape,selection:Y.peek(),gesture:ri,floating:X},u=new mr(o,K.shape,ti.peek().simQuality),d=ti.peek();u.setParams({ambientC:d.ambientC,gravity:d.gravity,swirl:d.swirl}),u.reset();let f=K.track(),p=new Cn(o),m=new Dn(o),h={velocity:u.velocity,simShape:u.simShape,quality:u.quality,tiles:s.tiles,tileShape:K.shape},g={lo:0,hi:100},_=[-1,-1],v=[0,0,0],y={view:Qr,dpr:1,showGrid:!0,ambientC:20,simTime:0,heat:{texture:u.temperature,simShape:u.simShape,quality:u.quality,on:!0,lo:0,hi:100},flow:{texture:u.tileAverages,arrows:!0},selected:_,hover:bi},b=()=>{$r.w=n.clientWidth,$r.h=n.clientHeight,Qr.fitted?Lt(Qr,K.shape,$r.w,$r.h):Rt(Qr,K.shape,$r.w,$r.h),Z()},x=new ResizeObserver(b);x.observe(n),b();let S=Kt(n,{view:Qr,shape:()=>K.shape,activeType:()=>ei.value,setActiveType:e=>{ei.value=e,q.peek()===`pointer`&&(q.value=`brush`)},tool:()=>q.peek(),setTool:e=>q.value=e,beginStroke:Oi,endStroke:ki,undo:xa,redo:Sa,paint:Ai,select:ji,gesture:ri,hasSelection:Ii,inSelection:Li,commitMarquee:Ri,beginMove:Ki,moveBy:qi,endMove:Ji,isPasting:Yi,placePaste:$i,cancelPaste:Qi,clearSelection:()=>Ni(new Set),copy:()=>void Hi(),cut:Ui,paste:Zi,transform:Gi,rotate:oa,hasObjectTarget:na,adjust:ia,toggleObject:aa,hover:(e,t)=>{(bi[0]!==e||bi[1]!==t)&&(bi[0]=e,bi[1]=t,hi.value=e<0?null:V(K.shape,e,t),Xi(),Z())},fit:Ti,requestRender:Z,togglePlay:_i,step:vi}),C=nt(()=>{ti.value,J.value,Y.value,li.value;let e=q.value;n.style.cursor=e===`pointer`?`default`:`crosshair`,Z()}),w=0,T=performance.now(),E=0,ee=0,D=-1/0,O=!0,k=!1,A=null,j=null,te=-1/0,M=!0,ne=(e,t)=>Math.abs(e-g.lo)<.05&&Math.abs(t-g.hi)<.05?!1:(g.lo=e,g.hi=t,fi.value={lo:e,hi:t},!0),re=e=>{w=requestAnimationFrame(re),ee++;let t=Math.min(.1,Math.max(0,(e-T)/1e3));T=e;let n=ti.peek(),r=wi();yt(u.tileShape,K.shape)&&u.quality===n.simQuality||(u.resize(K.shape,n.simQuality),O=!0),u.setParams({ambientC:n.ambientC,gravity:n.gravity,swirl:n.swirl}),u.setTiles(K,f),gi.reset&&(gi.reset=!1,u.reset(),E=0,O=!0);let i=0,a=0;if(li.peek()){for(gi.steps=0,a=t*di.peek(),E+=a;E>=.016666666666666666&&i<8;)u.step(jn),E-=jn,i++;i===8&&(E=0)}else{for(E=0;gi.steps>0;gi.steps--,i++)u.step(jn);a=i*jn}i>0&&(O=!0),s.sync(K),h.velocity=u.velocity,h.simShape=u.simShape,h.quality=u.quality,h.tileShape=K.shape;let d=!1;n.overlays.particles&&(a>0||p.needsSpawn)&&(p.step(a,h),d=!0),(i>0||r)&&(M=!0),n.overlays.streamlines&&M&&(ee-te>=4||!m.traced)&&(m.trace(h),te=ee,M=!1,d=!0);let b=!1,x=n.heatScale.auto,S=J.peek(),C=hi.peek(),N=S!==A||C!==j;if((x||S!==null||C!==null)&&(O&&ee-D>=6||N||x&&!k)&&(u.readField(`temperature`,pi.temp),u.readField(`velocity`,pi.vel),pi.count=K.types.length,mi.value++,D=ee,O=!1,x)){let e=1/0,t=-1/0;for(let n=0;n<pi.count;n++){let r=pi.temp[n];r<e&&(e=r),r>t&&(t=r)}b=ne(Math.min(e,n.ambientC-2),Math.max(t,n.ambientC+2))}if(A=S,j=C,x||(b=ne(n.heatScale.minC,n.heatScale.maxC)),k=x,!r&&i===0&&!b&&!d)return;y.dpr=window.devicePixelRatio||1,y.showGrid=n.overlays.gridLines,y.ambientC=n.ambientC,y.simTime=u.time,y.heat.texture=u.temperature,y.heat.simShape=u.simShape,y.heat.quality=u.quality,y.heat.on=n.overlays.heatMap,y.heat.lo=g.lo,y.heat.hi=g.hi,y.flow.texture=u.tileAverages,y.flow.arrows=n.overlays.arrows;let ie=J.peek();ie===null?_[0]=_[1]=-1:(_t(K.shape,ie,v),_[0]=v[0],_[1]=v[1]),Jt(o,y.dpr),s.draw(y,0),n.overlays.streamlines&&m.draw(y),n.overlays.particles&&p.draw(y),s.draw(y,1),l.dpr=y.dpr,l.shape=K.shape,l.selection=Y.peek(),c.draw(l)};return w=requestAnimationFrame(re),()=>{cancelAnimationFrame(w),u.dispose(),p.dispose(),m.dispose(),C(),S(),x.disconnect()}},[]),n?$(`div`,{class:`unsupported`,children:[$(`h1`,{children:`Unsupported browser`}),$(`p`,{children:[`This simulator needs WebGL2 with float render targets. `,n,` Try a recent version of Chrome, Firefox, Edge, or Safari, and make sure hardware acceleration is turned on.`]})]}):$(`div`,{class:`app`,children:[$(_o,{}),ci.value&&$(`div`,{class:`notice`,role:`alert`,children:[$(`span`,{children:ci.value}),$(`button`,{onClick:()=>ci.value=null,children:`Dismiss`})]}),$(`div`,{class:`main`,children:[$(`div`,{class:`stage`,children:$(`div`,{class:`viewport`,children:[$(`canvas`,{ref:e}),$(`canvas`,{ref:t,class:`overlay`}),$(Ya,{}),$(eo,{})]})}),$(qa,{})]})]})}se($(vo,{}),document.getElementById(`app`));