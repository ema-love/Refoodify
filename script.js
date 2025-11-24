document.addEventListener('DOMContentLoaded', function(){
      // Tips page search (via backend proxy)
      if(document.getElementById('tipsSearch')){
        async function fetchTips(query) {
          const url = `/api/search/tips?q=${encodeURIComponent(query)}`;
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            if (data.success) {
              return data.data;
            }
            return null;
          } catch (e) {
            console.error('Tips fetch error:', e.message);
            return null;
          }
        }
        document.getElementById('tipsSearch').addEventListener('submit', async function(ev){
          ev.preventDefault();
          var q = document.getElementById('tipsQuery').value.trim();
          if(!q) return;
          var tipsGrid = document.querySelector('.tips-grid');
          if(tipsGrid) tipsGrid.innerHTML = '<div class="tip-card">Searching tips...</div>';
          var data = await fetchTips(q);
          if(!data || !data.items || data.items.length === 0){
            if(tipsGrid) tipsGrid.innerHTML = '<div class="tip-card">No tips found. Try another search.</div>';
            return;
          }
          if(tipsGrid) tipsGrid.innerHTML = data.items.map(item =>
            `<div class="tip-card">
              <div class="tip-meta"><a href="${item.link}" target="_blank">${item.title}</a></div>
              <div class="tip-text">${item.snippet}</div>
            </div>`
          ).join('');
        });
      }
    // Google Maps for Donations page (mock implementation for now)
    if(document.getElementById('donationMap')){
      function initDonationMap(){
        const mapContainer = document.getElementById('donationMap');
        if (!mapContainer) return;
        
        // Mock map display
        mapContainer.innerHTML = `
          <div style="width:100%; height:100%; background:linear-gradient(135deg, #BBD29B, #8DA966); display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:12px; color:#fff; font-family:Arial, sans-serif;">
            <div style="font-size:48px; margin-bottom:1rem;">🗺️</div>
            <h3 style="margin:0 0 0.5rem; font-size:1.3rem;">Donation Centers Near You</h3>
            <p style="margin:0 0 1.5rem; font-size:0.9rem; opacity:0.9; max-width:300px; text-align:center;">Search for food donation and collection centers in your area. Enter your location above to get started.</p>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; width:100%; padding:1rem;">
              <div style="background:rgba(255,255,255,0.2); padding:1rem; border-radius:8px; text-align:center; font-size:0.85rem;">
                <div style="font-size:24px; margin-bottom:0.3rem;">📍</div>
                <strong>Kigali Food Bank</strong>
                <p style="margin:0.3rem 0 0; font-size:0.8rem; opacity:0.9;">Center District</p>
              </div>
              <div style="background:rgba(255,255,255,0.2); padding:1rem; border-radius:8px; text-align:center; font-size:0.85rem;">
                <div style="font-size:24px; margin-bottom:0.3rem;">🌱</div>
                <strong>Green Center</strong>
                <p style="margin:0.3rem 0 0; font-size:0.8rem; opacity:0.9;">South District</p>
              </div>
              <div style="background:rgba(255,255,255,0.2); padding:1rem; border-radius:8px; text-align:center; font-size:0.85rem;">
                <div style="font-size:24px; margin-bottom:0.3rem;">❤️</div>
                <strong>Hope Meals</strong>
                <p style="margin:0.3rem 0 0; font-size:0.8rem; opacity:0.9;">East District</p>
              </div>
            </div>
          </div>
        `;
      }
      initDonationMap();
    }
  var closeBtn = document.querySelector('.promo-close');
  var bar = document.querySelector('.promo-bar');
  if(closeBtn && bar){
    closeBtn.addEventListener('click', function(){
      bar.style.display = 'none';
    });
  }

  var profileBtn = document.querySelector('.profile-btn');
  var header = document.querySelector('.refoodify-header');
  if(profileBtn){
    profileBtn.addEventListener('click', function(){
      var profile = profileBtn.closest('.profile');
      var isOpen = profile.classList.toggle('open');
      profileBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var mobileBtn = document.querySelector('.mobile-menu-btn');
  if(mobileBtn && header){
    mobileBtn.addEventListener('click', function(){
      header.classList.toggle('nav-open');
    });
  }

  var stats = document.querySelector('.stats-circle-chain');
  if(stats){
    var circles = Array.from(stats.querySelectorAll('.stat-circle'));
    function clearAll(){
      circles.forEach(function(c){
        c.classList.remove('active','wander1','wander2','wander3','wander4','dance');
        c.style.opacity = 0;
      });
    }
    function placeCircles(){
      var w = stats.clientWidth;
      var h = stats.clientHeight;
      var size = circles[0] ? circles[0].offsetWidth || 160 : 160;
      var placed = [];
      circles.forEach(function(c){
        var tries = 0;
        var x, y;
        do{
          x = Math.floor(Math.random() * (w - size));
          y = Math.floor(Math.random() * (h - size));
          var ok = placed.every(function(p){
            var dx = p.x - x; var dy = p.y - y;
            return Math.hypot(dx, dy) > size + 10;
          });
          if(ok){ break; }
          tries++;
        } while(tries < 20);
        placed.push({x:x, y:y});
        c.style.left = x + 'px';
        c.style.top = y + 'px';
        c.style.transform = 'translate(0,0)';
      });
    }
    function startSequence(){
      clearAll();
      placeCircles();
      var delays = [0, 700, 1400, 2100];
      circles.forEach(function(c, i){
        setTimeout(function(){ c.classList.add('active','wander'+(i+1)); }, delays[i]);
      });
      var wanderDuration = 8000;
      setTimeout(function(){
        circles.forEach(function(c){ c.classList.remove('active','wander1','wander2','wander3','wander4'); c.classList.add('dance'); });
        setTimeout(function(){ startSequence(); }, 3000);
      }, Math.max.apply(null, delays) + wanderDuration);
    }
    startSequence();
  }
});
  var AUTH_KEY = 'refoodify_auth_v1';
  function isAuthed(){ try{ return JSON.parse(localStorage.getItem(AUTH_KEY) || 'false'); }catch(e){ return false; } }
  function setAuthed(v){ localStorage.setItem(AUTH_KEY, JSON.stringify(Boolean(v))); }
  function clearAuth(){ localStorage.removeItem(AUTH_KEY); }
  document.querySelectorAll('a[href="login.html"]').forEach(function(a){ a.addEventListener('click', function(){ clearAuth(); }); });
  var toggles = document.querySelectorAll('.toggle-password');
  toggles.forEach(function(btn){
    btn.addEventListener('click', function(){
      var input = btn.previousElementSibling;
      if(!input) return;
      var t = input.getAttribute('type');
      input.setAttribute('type', t === 'password' ? 'text' : 'password');
    });
  });

  var loginEmail = document.querySelector('#login-email');
  if(loginEmail){
    var loginForm = loginEmail.closest('form');
    if(loginForm){
      loginForm.addEventListener('submit', function(ev){
        ev.preventDefault();
        setAuthed(true);
        // Redirect to home and ensure header will show profile
        window.location.replace('index.html');
      });
    }
  }

  // Register form handling: set auth and redirect to home
  var regEmail = document.querySelector('#reg-email');
  if(regEmail){
    var regForm = regEmail.closest('form');
    if(regForm){
      regForm.addEventListener('submit', function(ev){
        ev.preventDefault();
        // Basic client-side validation could be extended here
        setAuthed(true);
        window.location.replace('index.html');
      });
    }
  }

  // Social sign-in buttons (simulate auth for demo)
  document.querySelectorAll('.social-btn').forEach(function(sb){
    sb.addEventListener('click', function(){
      // In a real app this would start OAuth flow
      setAuthed(true);
      window.location.replace('index.html');
    });
  });

  var analyzerForm = document.querySelector('.analyzer-search');
  if(analyzerForm){
    analyzerForm.addEventListener('submit', function(ev){
      ev.preventDefault();
    });
  }

  var donateModalOverlay = document.querySelector('.don-modal-overlay');
  var partnerDrawer = document.querySelector('.don-drawer');
  var openDonateBtns = document.querySelectorAll('.open-donate');
  var openPartnerBtns = document.querySelectorAll('.open-partner');

  openDonateBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      if(donateModalOverlay){ donateModalOverlay.style.display = 'flex'; }
    });
  });
  openPartnerBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      if(partnerDrawer){ partnerDrawer.style.display = 'block'; }
    });
  });
  var closeDonate = document.querySelector('.don-modal-close');
  if(closeDonate){
    closeDonate.addEventListener('click', function(){ if(donateModalOverlay){ donateModalOverlay.style.display = 'none'; } });
  }
  var closeDrawer = document.querySelector('.don-drawer-close');
  if(closeDrawer){
    closeDrawer.addEventListener('click', function(){ if(partnerDrawer){ partnerDrawer.style.display = 'none'; } });
  }

  var trackerPage = document.querySelector('.tracker-page');
  if(trackerPage){
    var STORAGE_KEY = 'refoodify_pantry_v1';
    var CO2_PER_ITEM_KG = 0.5;
    function loadPantry(){
      try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }catch(e){ return []; }
    }
    function savePantry(items){ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
    function daysUntil(dateStr){ var today = new Date(); today.setHours(0,0,0,0); var d = new Date(dateStr); d.setHours(0,0,0,0); return Math.round((d - today)/86400000); }
    function statusFor(days){ if(days <= 0) return 'Expired'; if(days <= 2) return 'Urgent'; if(days <= 5) return 'Soon'; return 'Fresh'; }

    var form = document.getElementById('trackerForm');
    var cardsView = document.getElementById('cardsView');
    var tableView = document.getElementById('tableView');
    var tableBody = tableView ? tableView.querySelector('tbody') : null;
    var toggleViewBtn = document.getElementById('toggleView');
    var soonList = document.getElementById('soonList');
    var recipesList = document.getElementById('recipesList');
    var impactSaved = document.getElementById('impactSaved');
    var impactExpired = document.getElementById('impactExpired');
    var impactCO2 = document.getElementById('impactCO2');

    var pantry = loadPantry();

    function recompute(items){
      return items.map(function(it){
        var days = daysUntil(it.expiry);
        it.days = days; it.status = statusFor(days);
        return it;
      });
    }
    function render(){
      pantry = recompute(pantry);
      if(cardsView){ cardsView.innerHTML = ''; }
      if(tableBody){ tableBody.innerHTML = ''; }
      pantry.forEach(function(it, idx){
        var card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = '<div class="card-title">'+it.name+'</div>'+
          '<div class="card-meta">Qty: '+it.qty+' • Expiry: '+it.expiry+' • '+it.storage+'</div>'+
          '<span class="badge '+badgeClass(it.status)+'">'+it.status+(it.days>0?(' • '+it.days+'d'): '')+'</span>'+
          '<div class="card-actions">'+
          '<button class="btn btn-primary" data-act="use" data-idx="'+idx+'">Mark Used</button>'+
          '<button class="btn btn-outline" data-act="remove" data-idx="'+idx+'">Remove</button>'+
          '</div>';
        if(cardsView){ cardsView.appendChild(card); }

        if(tableBody){
          var tr = document.createElement('tr');
          tr.innerHTML = '<td>'+it.name+'</td><td>'+it.qty+'</td><td>'+it.expiry+'</td><td>'+it.storage+'</td><td>'+it.status+'</td>'+
            '<td><button class="btn btn-primary" data-act="use" data-idx="'+idx+'">Use</button> <button class="btn btn-outline" data-act="remove" data-idx="'+idx+'">Remove</button></td>';
          tableBody.appendChild(tr);
        }
      });
      renderSoon();
      renderRecipes();
      renderImpact();
      wireActions();
    }
    function badgeClass(s){
      return s==='Fresh'?'badge badge-fresh': s==='Soon'?'badge badge-soon': s==='Urgent'?'badge badge-urgent':'badge badge-expired';
    }
    function wireActions(){
      var buttons = trackerPage.querySelectorAll('[data-act]');
      buttons.forEach(function(b){
        b.onclick = function(){
          var act = b.getAttribute('data-act'); var idx = parseInt(b.getAttribute('data-idx'),10);
          if(act==='remove'){ pantry.splice(idx,1); savePantry(pantry); render(); }
          if(act==='use'){
            pantry[idx].used = true; pantry[idx].usedAt = new Date().toISOString();
            savePantry(pantry);
            // celebration for first used item or milestone
            try{
              var usedCount = pantry.filter(function(it){ return it.used; }).length;
              if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){}
              else if(usedCount === 1){ launchConfetti({count: 40, spread: 50, duration: 800}); }
              else if(usedCount > 0 && usedCount % 10 === 0){ launchConfetti({count: 160, spread: 80, duration: 1200}); }
            }catch(e){}
            render();
          }
        };
      });
    }
    function renderSoon(){
      if(!soonList) return; soonList.innerHTML = '';
      pantry.filter(function(it){ return it.status==='Soon' || it.status==='Urgent'; })
        .sort(function(a,b){ return a.days - b.days; })
        .forEach(function(it){
          var li = document.createElement('li');
          li.textContent = it.name+' — '+it.days+'d • '+it.storage;
          soonList.appendChild(li);
        });
    }
    function renderRecipes(){
      if(!recipesList) return; recipesList.innerHTML = '';
      var expiring = pantry.filter(function(it){ return it.status==='Soon' || it.status==='Urgent'; });
      var suggestions = suggestRecipes(expiring.map(function(it){ return it.name; }));
      suggestions.slice(0,5).forEach(function(s){ var li=document.createElement('li'); li.textContent = s; recipesList.appendChild(li); });
    }
    function renderImpact(){
      var saved = pantry.filter(function(it){ return it.used===true; }).length;
      var expired = pantry.filter(function(it){ return it.status==='Expired' && !it.used; }).length;
      if(impactSaved) impactSaved.textContent = String(saved);
      if(impactExpired) impactExpired.textContent = String(expired);
      if(impactCO2) impactCO2.textContent = (saved * CO2_PER_ITEM_KG).toFixed(1)+' kg';
    }
    function suggestRecipes(names){
      var map = {
        'milk':['Creamy rice pudding','Quick pancakes','Smoothie with spinach'],
        'spinach':['Garlic sautéed spinach','Green omelette','Spinach smoothie'],
        'tomato':['Tomato bruschetta','Quick pasta arrabbiata','Tomato soup'],
        'bread':['French toast','Bread pudding','Garlic croutons'],
        'banana':['Banana bread','Frozen banana pops','Banana pancakes']
      };
      var out = [];
      names.forEach(function(n){
        var k = n.toLowerCase();
        Object.keys(map).forEach(function(key){ if(k.indexOf(key) !== -1){ out = out.concat(map[key]); } });
      });
      if(out.length===0){ out = ['Fried rice with leftovers','Veggie stir-fry','Hearty soup with mixed veg','Omelette with chopped veggies']; }
      return Array.from(new Set(out));
    }

    if(form){
      form.addEventListener('submit', function(ev){
        ev.preventDefault();
        if(!isAuthed()){ window.location.href = 'login.html'; return; }
        var name = document.getElementById('tName').value.trim();
        var qty = document.getElementById('tQty').value.trim();
        var expiry = document.getElementById('tExpiry').value;
        var storage = document.getElementById('tStorage').value;
        if(!name || !qty || !expiry) return;
        pantry.push({ name:name, qty:qty, expiry:expiry, storage:storage, addedAt:new Date().toISOString(), used:false });
        savePantry(pantry);
        form.reset();
        render();
      });
    }
    if(toggleViewBtn){
      toggleViewBtn.addEventListener('click', function(){
        var tableShown = tableView && tableView.style.display === 'table';
        if(tableView) tableView.style.display = tableShown ? 'none' : 'table';
        if(cardsView) cardsView.style.display = tableShown ? 'grid' : 'none';
      });
    }
    // initial state
    if(cardsView) cardsView.style.display = 'grid';
    if(tableView) tableView.style.display = 'none';
    render();
  }

  var analyzerPage = document.querySelector('.analyzer-page');
  if(analyzerPage){
      var anForm = document.getElementById('anForm');
      var anQuery = document.getElementById('anQuery');
      var anChips = document.getElementById('anChips');
      var anFilters = document.getElementById('anFilters');
      var riskRing = document.getElementById('riskRing');
      var riskLabel = document.getElementById('riskLabel');
      var keyList = document.getElementById('keyList');
      var recipesGrid = document.getElementById('recipesGrid');
      var activeCat = '';
      var ingredients = [];
      var iconByCat = { Vegetables:'🥬', Fruits:'🍎', Dairy:'🥛', Pantry:'📦' };

      // Spoonacular API integration (via backend proxy)
      async function fetchSpoonacularRecipes(ingredientList) {
        const query = encodeURIComponent(ingredientList.join(","));
        // Call local backend proxy instead of direct API
        const url = `/api/recipes/findByIngredients?ingredients=${query}&number=6`;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error('API error: ' + res.status);
          const data = await res.json();
          if (data.success) {
            return data.data;
          } else {
            console.error('Backend error:', data.error);
            return [];
          }
        } catch (e) {
          console.error('Fetch error:', e.message);
          return [];
        }
      }

      async function handleAnalyzerSubmit(ev) {
        ev.preventDefault();
        addIngredientsFromQuery();
        if (ingredients.length === 0) return;
        recipesGrid.innerHTML = '<div class="recipe-card">Loading recipes...</div>';
        const apiResults = await fetchSpoonacularRecipes(ingredients.map(i => i.name));
        if (apiResults.length === 0) {
          recipesGrid.innerHTML = '<div class="recipe-card">No recipes found. Try different ingredients.</div>';
          return;
        }
        recipesGrid.innerHTML = apiResults.map(r =>
          `<div class="recipe-card">
            <div class="recipe-thumb"><img src="${r.image}" alt="${r.title}" style="width:64px;height:64px;border-radius:8px;"></div>
            <div class="recipe-body">
              <div class="recipe-name">${r.title}</div>
              <div class="recipe-uses">Used: ${r.usedIngredientCount}, Missed: ${r.missedIngredientCount}</div>
              <a href="https://spoonacular.com/recipes/${r.title.replace(/\s+/g,'-')}-${r.id}" target="_blank" class="btn btn-primary" style="margin-top:8px;">View Recipe</a>
            </div>
          </div>`
        ).join('');
      }
    function detectCat(name){
      var n = name.toLowerCase();
      if(/tomato|carrot|onion|lettuce|spinach|pepper|cucumber|broccoli/.test(n)) return 'Vegetables';
      if(/banana|apple|orange|lemon|berry|grape|mango|pineapple/.test(n)) return 'Fruits';
      if(/milk|cheese|yogurt|butter|cream/.test(n)) return 'Dairy';
      if(/rice|pasta|beans|lentils|flour|oil|salt|sugar|spice/.test(n)) return 'Pantry';
      return 'Pantry';
    }
    function addIngredientsFromQuery(){
      var q = (anQuery.value || '').trim();
      if(!q) return;
      var parts = q.split(/[,\n]+|\s{2,}/).map(function(s){ return s.trim(); }).filter(Boolean);
      parts.forEach(function(p){ ingredients.push({ name:p, cat: detectCat(p) }); });
      anQuery.value = '';
      render();
    }
    function removeIngredient(idx){ ingredients.splice(idx,1); render(); }
    function chipHTML(ing, idx){ return '<div class="chip"><span class="chip-cat">'+ing.cat+'</span><span>'+ing.name+'</span><button class="chip-remove" data-idx="'+idx+'" aria-label="Remove">×</button></div>'; }
    function renderChips(){ var data = ingredients.filter(function(i){ return !activeCat || i.cat===activeCat; }); anChips.innerHTML = data.map(function(i,idx){ return chipHTML(i, idx); }).join(''); var btns = anChips.querySelectorAll('.chip-remove'); btns.forEach(function(b){ b.onclick = function(){ var i = parseInt(b.getAttribute('data-idx'),10); removeIngredient(i); }; }); }
    function computeRisk(){ var base = Math.min(100, ingredients.length * 8); return base; }
    function pseudoDays(name){ return (name.length % 5) + 1; }
    function renderInsights(){ var risk = computeRisk(); riskRing.style.setProperty('--risk', String(risk)); riskLabel.textContent = 'Waste Risk Score: ' + risk + '%'; var next = ingredients[0]; var days = next ? pseudoDays(next.name) : 0; var actions = risk > 60 ? 'Use immediately' : risk > 30 ? 'Donate soon' : 'Monitor'; var items = [];
      items.push('<li class="key-item">⏳ Next to Expire: '+ (next ? (next.name + ' — ' + days + ' days') : 'N/A') +'</li>');
      items.push('<li class="key-item">📦 Total Ingredients: '+ ingredients.length +'</li>');
      items.push('<li class="key-item">✅ Suggested Actions: '+ actions +'</li>');
      keyList.innerHTML = items.join('');
    }
    var recipes = [
      { name:'Tomato Pasta', uses:['tomato','pasta'], icon:'🍝' },
      { name:'Veggie Stir-Fry', uses:['carrot','onion','pepper'], icon:'🥘' },
      { name:'Fruit Smoothie', uses:['banana','yogurt'], icon:'🥤' },
      { name:'Herb Omelette', uses:['egg','herbs'], icon:'🍳' },
      { name:'Rice Bowl', uses:['rice','beans','spinach'], icon:'🍚' }
    ];
    function matchesActiveCat(ingName){ if(!activeCat) return true; var cat = detectCat(ingName); return cat === activeCat; }
    function renderRecipes(){ var names = ingredients.map(function(i){ return i.name.toLowerCase(); }); var cards = recipes.filter(function(r){ return r.uses.some(function(u){ return names.indexOf(u) !== -1; }) || ingredients.length===0; }).slice(0,4).map(function(r){ return '<div class="recipe-card"><div class="recipe-thumb">'+r.icon+'</div><div class="recipe-body"><div class="recipe-name">'+r.name+'</div><div class="recipe-uses">Uses: '+r.uses.join(', ')+'</div></div></div>'; }); recipesGrid.innerHTML = cards.join(''); }
    function render(){ renderChips(); renderInsights(); renderRecipes(); }
    if(anForm){ anForm.addEventListener('submit', handleAnalyzerSubmit); }
    var scanBtn = document.getElementById('anScan'); if(scanBtn){ scanBtn.addEventListener('click', function(){ alert('Image scan coming soon. Upload support will be added.'); }); }
    anFilters.addEventListener('click', function(ev){ var btn = ev.target.closest('.filter-btn'); if(!btn) return; anFilters.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); }); btn.classList.add('active'); activeCat = btn.getAttribute('data-cat') || ''; render(); });
    render();
  }

  var regPassword = document.querySelector('#reg-password');
  var pwStrength = document.querySelector('#pwStrength');
  if(regPassword && pwStrength){
    function scorePw(p){
      var s = 0; if(p.length >= 8) s += 30; if(/[A-Z]/.test(p)) s += 20; if(/[a-z]/.test(p)) s += 20; if(/[0-9]/.test(p)) s += 15; if(/[^\w]/.test(p)) s += 15; return Math.min(100, s);
    }
    regPassword.addEventListener('input', function(){ var v = regPassword.value || ''; var sc = scorePw(v); var bar = pwStrength.querySelector('.pw-bar'); if(bar){ bar.style.width = sc + '%'; } });
  }
  var regEmail = document.querySelector('#reg-email');
  if(regEmail){
    var regForm = regEmail.closest('form');
    if(regForm){
      regForm.addEventListener('submit', function(ev){
        ev.preventDefault();
        setAuthed(true);
        // Respect users who prefer reduced motion
        if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
          window.location.replace('index.html');
          return;
        }
        // Play a short confetti burst, then redirect so user sees the celebration
        try{ launchConfetti({count: 80, spread: 60, duration: 900}); }catch(e){}
        setTimeout(function(){ window.location.replace('index.html'); }, 900);
      });
    }
  }
  var authSection = document.querySelector('.auth-section');
  if(authSection){
    var authForm = authSection.querySelector('form');
    if(authForm){
      authForm.addEventListener('submit', function(ev){
        ev.preventDefault();
        setAuthed(true);
        if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
          window.location.replace('index.html');
          return;
        }
        try{ launchConfetti({count: 60, spread: 50, duration: 800}); }catch(e){}
        setTimeout(function(){ window.location.replace('index.html'); }, 800);
      });
    }
  }

  // Ensure header shows login/signup for guests and profile for signed-in users
  function updateHeaderForAuth(){
    try{
      var header = document.querySelector('.refoodify-header');
      if(!header) return;
      var headerInner = header.querySelector('.header-inner') || header;
      var headerLeft = header.querySelector('.header-left') || headerInner;
      var headerAuth = header.querySelector('.header-auth');
      var profile = header.querySelector('.profile');
      var authed = isAuthed();

      if(!authed){
        // show login/signup, hide profile
        if(profile) profile.style.display = 'none';
        if(!headerAuth){
          headerAuth = document.createElement('div');
          headerAuth.className = 'header-auth';
          headerAuth.innerHTML = '<a class="btn" href="login.html">Log in</a> <a class="btn btn-primary" href="register.html">Sign up</a>';
          // append to headerInner (prefer right side)
          headerInner.appendChild(headerAuth);
          // wire login link to clearAuth before navigating
          var la = headerAuth.querySelector('a[href="login.html"]');
          if(la) la.addEventListener('click', function(){ clearAuth(); });
        }
        if(headerAuth) headerAuth.style.display = 'flex';
      } else {
        // user is authed: hide login/signup, show profile
        if(headerAuth) { try{ headerAuth.parentNode && headerAuth.parentNode.removeChild(headerAuth); }catch(e){} }
        if(profile) { profile.style.display = ''; }
        else {
          // insert a profile UI if missing
          var p = document.createElement('div');
          p.className = 'profile';
          p.innerHTML = '<button class="profile-btn" aria-haspopup="true" aria-expanded="false">\n            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">\n              <circle cx="12" cy="8" r="4" stroke-width="2"></circle>\n              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke-width="2" stroke-linecap="round"></path>\n            </svg>\n          </button>\n          <div class="profile-menu">\n            <a href="profile.html">Profile</a>\n            <a href="saved.html">Saved Recipes</a>\n            <a href="#" class="sign-out-link">Sign Out</a>\n          </div>';
          // prefer placing in headerLeft
          headerLeft.insertBefore(p, headerLeft.firstChild);
          // wire button toggle
          var btn = p.querySelector('.profile-btn');
          if(btn){ btn.addEventListener('click', function(){ var isOpen = p.classList.toggle('open'); btn.setAttribute('aria-expanded', String(isOpen)); }); }
          var so = p.querySelector('.sign-out-link');
          if(so){ so.addEventListener('click', function(ev){ ev.preventDefault(); clearAuth(); window.location.reload(); }); }
        }
      }
    }catch(e){ /* non-fatal */ }
  }

  // run on DOM ready (and also after auth actions) to sync header
  document.addEventListener('DOMContentLoaded', function(){ updateHeaderForAuth(); });

  var profileTabs = document.querySelector('#profileTabs');
  if(profileTabs){
    profileTabs.addEventListener('click', function(ev){ var btn = ev.target.closest('.tab-btn'); if(!btn) return; profileTabs.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); }); btn.classList.add('active'); var tab = btn.getAttribute('data-tab'); ['overview','saved','settings'].forEach(function(id){ var p = document.querySelector('#tab-'+id); if(p){ p.style.display = (id===tab) ? 'block' : 'none'; } }); });
  }

  var savedPage = document.querySelector('.saved-page');
  if(savedPage){
    var savedGrid = document.getElementById('savedGrid');
    var savedCat = document.getElementById('savedCat');
    var savedSort = document.getElementById('savedSort');
    var savedEmpty = document.getElementById('savedEmpty');
    if(!isAuthed()){ savedGrid.innerHTML=''; savedEmpty.style.display='block'; var t = savedEmpty.querySelector('.empty-title'); if(t){ t.textContent = 'Login to view saved items'; } var b = savedEmpty.querySelector('.btn'); if(b){ b.setAttribute('href','login.html'); } return; }
    var items = [
      { id:'s1', cat:'Meals', title:'Veggie Bowl', desc:'Spinach, rice, beans', icon:'🥗', date: 6, pop: 20 },
      { id:'s2', cat:'Recipes', title:'Tomato Pasta', desc:'Tomato, pasta', icon:'🍝', date: 3, pop: 50 },
      { id:'s3', cat:'Donations', title:'Green Center', desc:'Downtown food bank', icon:'🏪', date: 10, pop: 5 }
    ];
    function renderSaved(){ var cat = savedCat.value || ''; var sort = savedSort.value || 'date'; var list = items.filter(function(i){ return !cat || i.cat===cat; }); list.sort(function(a,b){ return sort==='date' ? b.date - a.date : b.pop - a.pop; }); savedGrid.innerHTML = list.map(function(i){ return '<div class="item-card"><div class="item-thumb">'+i.icon+'</div><div class="item-title">'+i.title+'</div><div class="item-desc">'+i.desc+'</div><div class="item-actions"><a class="btn-view" href="#">View Details</a><button class="btn-remove" data-id="'+i.id+'">Remove</button></div></div>'; }).join(''); savedEmpty.style.display = list.length ? 'none' : 'block'; wireRemove(); }
    function wireRemove(){ var btns = savedGrid.querySelectorAll('.btn-remove'); btns.forEach(function(b){ b.onclick = function(){ var id = b.getAttribute('data-id'); items = items.filter(function(i){ return i.id!==id; }); renderSaved(); }; }); }
    if(savedCat){ savedCat.addEventListener('change', renderSaved); }
    if(savedSort){ savedSort.addEventListener('change', renderSaved); }
    renderSaved();
  }

  var tipsPage = document.querySelector('.tips-page');
  if(tipsPage){
    var TIPS_KEY = 'refoodify_saved_tips_v1';
    function loadSavedTips(){ try{ return JSON.parse(localStorage.getItem(TIPS_KEY) || '[]'); }catch(e){ return []; } }
    function saveSavedTips(ids){ localStorage.setItem(TIPS_KEY, JSON.stringify(ids)); }
    var tips = [
      { id:'t1', cat:'Storage Tips', icon:'jar', text:'Store carrots submerged in water in the fridge to keep them crisp for weeks.' },
      { id:'t2', cat:'Zero-Waste Hacks', icon:'leaf', text:'Use vegetable scraps to make a rich homemade stock.' },
      { id:'t3', cat:'Near-Expiry Tips', icon:'basket', text:'Turn near-expiry yogurt into smoothies or frozen pops.' },
      { id:'t4', cat:'Ingredient-Specific Tips', icon:'fridge', text:'Keep herbs fresh by storing them upright in a jar of water like a bouquet.' },
      { id:'t5', cat:'Beginner Tips', icon:'leaf', text:'Plan meals for the week and shop with a list to avoid waste.' },
      { id:'t6', cat:'Budget-Friendly Tips', icon:'basket', text:'Freeze leftover cooked rice in portions to reduce waste and save time.' },
      { id:'t7', cat:'Storage Tips', icon:'fridge', text:'Keep bread in a cool, dry place; freeze slices to extend shelf life.' },
      { id:'t8', cat:'Zero-Waste Hacks', icon:'leaf', text:'Regrow green onions by placing roots in a jar of water.' },
      { id:'t9', cat:'Near-Expiry Tips', icon:'jar', text:'Make a quick pickle with near-expiry cucumbers, vinegar, salt, and sugar.' }
    ];
    var icons = {
      jar:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="7" y="4" width="10" height="16" rx="2" stroke-width="2"/><path d="M9 4h6" stroke-width="2" stroke-linecap="round"/></svg>',
      leaf:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3c-4 3-6 6-6 9a6 6 0 0012 0c0-3-2-6-6-9z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      fridge:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="7" y="3" width="10" height="18" rx="2" stroke-width="2"/><path d="M7 10h10" stroke-width="2"/><path d="M9 7v4" stroke-width="2"/></svg>',
      basket:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 9h16l-2 9H6L4 9z" stroke-width="2"/><path d="M9 9l3-5 3 5" stroke-width="2" stroke-linecap="round"/></svg>'
    };
    var catOrder = ['Storage Tips','Zero-Waste Hacks','Near-Expiry Tips','Ingredient-Specific Tips','Beginner Tips','Budget-Friendly Tips'];
    var tipOfDayEl = document.getElementById('tipOfDay');
    var shuffleBtn = document.getElementById('tipsShuffle');
    var tipsGrid = document.getElementById('tipsGrid');
    var tipsCats = document.getElementById('tipsCats');
    var savedSection = document.getElementById('tipsSavedSection');
    var savedRow = document.getElementById('savedRow');
    var queryInput = document.getElementById('tipsQuery');
    var filterSelect = document.getElementById('tipsFilter');
    var searchForm = document.getElementById('tipsSearch');
    var saved = loadSavedTips();
    var activeCat = '';
    function randomTip(){ return tips[Math.floor(Math.random()*tips.length)].text; }
    function renderCats(){ tipsCats.innerHTML = ''; catOrder.forEach(function(c){ var b = document.createElement('button'); b.className = 'cat-btn' + (activeCat===c?' active':''); b.innerHTML = c; b.onclick = function(){ activeCat = c; filterSelect.value = c; render(); }; tipsCats.appendChild(b); }); var allBtn = document.createElement('button'); allBtn.className = 'cat-btn' + (activeCat===''?' active':''); allBtn.innerHTML = 'All'; allBtn.onclick = function(){ activeCat = ''; filterSelect.value = ''; render(); }; tipsCats.insertBefore(allBtn, tipsCats.firstChild); }
    function matchTip(t){ var q = (queryInput.value || '').toLowerCase(); var cat = activeCat || filterSelect.value || ''; if(q && t.text.toLowerCase().indexOf(q) === -1) return false; if(cat && t.cat !== cat) return false; return true; }
    function tipCardHTML(t){ var savedFlag = saved.indexOf(t.id) !== -1; return '<div class="tip-card"><div class="tip-meta"><span class="tip-icon" style="color:#557C22">'+icons[t.icon]+'</span><span>'+t.cat+'</span></div><div class="tip-text">'+t.text+'</div><div class="tip-actions"><button class="save-btn" data-id="'+t.id+'">'+(savedFlag?'🔖 Saved':'🔖 Save')+'</button></div></div>'; }
    function render(){ var list = tips.filter(matchTip); tipsGrid.innerHTML = list.map(tipCardHTML).join(''); wireSaveButtons(); renderSaved(); renderCats(); }
    function wireSaveButtons(){
      var btns = tipsGrid.querySelectorAll('.save-btn');
      btns.forEach(function(b){
        b.onclick = function(){
          if(!isAuthed()){ window.location.href = 'login.html'; return; }
          var id = b.getAttribute('data-id');
          var i = saved.indexOf(id);
          var becameFirst = false;
          var removed = false;
          if(i===-1){ saved.push(id); becameFirst = (saved.length === 1); }
          else { saved.splice(i,1); removed = true; }
          saveSavedTips(saved);
          render();
          try{
            if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){}
            else {
              if(becameFirst){ launchConfetti({count: 36, spread:50, duration:700}); }
              else if(!removed && (saved.length % 10 === 0)){ launchConfetti({count: 120, spread:70, duration:1000}); }
            }
          }catch(e){}
        };
      });
    }
    function renderSaved(){ if(saved.length === 0){ savedSection.style.display = 'none'; savedRow.innerHTML = ''; return; } savedSection.style.display = 'block'; var cards = tips.filter(function(t){ return saved.indexOf(t.id)!==-1; }).map(function(t){ return '<div class="saved-card"><div class="tip-meta"><span class="tip-icon" style="color:#557C22">'+icons[t.icon]+'</span><span>'+t.cat+'</span></div><div class="tip-text">'+t.text+'</div></div>'; }); savedRow.innerHTML = cards.join(''); }
    if(tipOfDayEl){ tipOfDayEl.textContent = randomTip(); }
    if(shuffleBtn){ shuffleBtn.addEventListener('click', function(){ tipOfDayEl.textContent = randomTip(); }); }
    if(searchForm){ searchForm.addEventListener('submit', function(ev){ ev.preventDefault(); render(); }); }
    if(queryInput){ queryInput.addEventListener('input', function(){ render(); }); }
    if(filterSelect){ filterSelect.addEventListener('change', function(){ activeCat = filterSelect.value; render(); }); }
    renderCats();
    render();
  }

  // About page: reveal animations and stat spin triggers
  (function(){
    var revealEls = document.querySelectorAll('.reveal, .mission-text, .values-grid .value-card, .team-card, .guest-cta-card, .stat-card');
    if(revealEls.length === 0) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting) return;
        var el = en.target;
        // stagger children
        if(el.classList.contains('mission-text') || el.classList.contains('values-grid')){
          Array.from(el.querySelectorAll(':scope > *')).forEach(function(child, i){
            setTimeout(function(){ child.classList.add('visible'); }, i * 120);
          });
        }
        // stat-card -- add spin class
        if(el.classList.contains('stat-card')){
          el.classList.add('spin');
        }
        el.classList.add('visible');
        // add small flourish to team cards
        if(el.classList.contains('team-card')){
          el.style.transitionDelay = '60ms';
        }
        io.unobserve(el);
      });
    },{ threshold: 0.18 });
    revealEls.forEach(function(e){ io.observe(e); });
  })();

  // hero particle system for About page
  (function(){
    var canvas = document.getElementById('heroParticles');
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    var DPR = window.devicePixelRatio || 1;
    var particles = [];
    var max = 36;
    function resize(){
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(300, rect.width * DPR);
      canvas.height = Math.max(80, rect.height * DPR);
      ctx.scale(DPR, DPR);
    }
    function rand(min, max){ return Math.random() * (max - min) + min; }
    function initParticles(){
      particles = [];
      for(var i=0;i<max;i++){
        particles.push({
          x: rand(0, canvas.width / DPR),
          y: rand(0, canvas.height / DPR),
          r: rand(2, 9),
          vx: rand(-0.15, 0.15),
          vy: rand(-0.02, 0.03),
          alpha: rand(0.06, 0.28),
          hue: Math.floor(rand(90,140))
        });
      }
    }
    var rafId = null;
    function draw(){
      ctx.clearRect(0,0, canvas.width, canvas.height);
      particles.forEach(function(p){
        p.x += p.vx;
        p.y += p.vy + Math.sin((Date.now()+p.x)*0.0006) * 0.2;
        if(p.x < -20) p.x = canvas.width / DPR + 20;
        if(p.x > canvas.width / DPR + 20) p.x = -20;
        if(p.y < -40) p.y = canvas.height / DPR + 20;
        if(p.y > canvas.height / DPR + 40) p.y = -20;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*4);
        g.addColorStop(0, 'hsla('+p.hue+',60%,'+ (40 + p.r) +'%,'+ (p.alpha*1.0) +')');
        g.addColorStop(1, 'hsla('+ (p.hue+30) +',60%,40%,0)');
        ctx.beginPath(); ctx.fillStyle = g; ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      });
      rafId = window.requestAnimationFrame(draw);
    }
    function start(){ resize(); initParticles(); if(rafId) cancelAnimationFrame(rafId); draw(); }
    window.addEventListener('resize', function(){ if(canvas) { resize(); initParticles(); } });
    // start when in view
    var hero = document.querySelector('.page-hero');
    if(hero){
      var vis = new IntersectionObserver(function(entries){ if(entries[0] && entries[0].isIntersecting){ start(); vis.disconnect(); } }, { threshold: 0.1 });
      vis.observe(hero);
    } else { start(); }
  })();

  // Lightweight confetti burst (canvas) - used on registration/signup
  function launchConfetti(opts){
    opts = opts || {};
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var count = typeof opts.count === 'number' ? opts.count : 80;
    var duration = typeof opts.duration === 'number' ? opts.duration : 900;
    var spread = typeof opts.spread === 'number' ? opts.spread : 60;

    // Scale count by viewport width to preserve performance on small devices
    try{
      var vw = window.innerWidth || 800;
      var factor = Math.max(0.25, Math.min(1, vw / 1200));
      count = Math.max(6, Math.round(count * factor));
    }catch(e){}

    var colors = opts.colors || ['#ff4d6d','#ffd166','#06d6a0','#118ab2','#9b5de5','#f15bb5'];
    var canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = 9999;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var DPR = window.devicePixelRatio || 1;
    function resize(){ canvas.width = window.innerWidth * DPR; canvas.height = window.innerHeight * DPR; ctx.setTransform(DPR,0,0,DPR,0,0); }
    resize();
    window.addEventListener('resize', resize);

    var particles = [];
    function rand(min, max){ return Math.random()*(max-min)+min; }
    var cx = window.innerWidth/2, cy = window.innerHeight*0.28;
    for(var i=0;i<count;i++){
      var angle = (Math.PI/180) * rand(90 - spread/2, 90 + spread/2);
      var speed = rand(2,8);
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle)*speed * (Math.random()>0.5?1:-1),
        vy: -Math.abs(Math.sin(angle)*speed),
        r: rand(6,12),
        rot: rand(0,Math.PI*2),
        vr: rand(-0.2,0.2),
        color: colors[Math.floor(rand(0,colors.length))],
        life: rand(duration*0.6, duration*1.1),
        age: 0
      });
    }

    var start = performance.now();
    var raf;
    function draw(now){
      var t = now - start;
      ctx.clearRect(0,0, canvas.width, canvas.height);
      particles.forEach(function(p){
        var dt = Math.min(16, 16);
        p.age = t;
        p.vy += 0.15; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.995;
        p.vy *= 0.998;
        p.rot += p.vr;
        var alpha = 1 - (p.age / p.life);
        if(alpha < 0) alpha = 0;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*0.6);
        ctx.restore();
      });
      if(t < duration + 400){ raf = requestAnimationFrame(draw); }
      else { cleanup(); }
    }
    function cleanup(){
      cancelAnimationFrame(raf);
      try{ window.removeEventListener('resize', resize); }catch(e){}
      if(canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
    raf = requestAnimationFrame(draw);
    // safety cleanup
    setTimeout(cleanup, duration + 1200);
    return { stop: cleanup };
  }
});