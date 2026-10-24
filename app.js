/* =============================================
   ToolKit Pro – app.js  (Fixed Version)
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ─── SAFE ELEMENT GETTER ──────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }
  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return document.querySelectorAll(sel); }

  // ─── NAVIGATION ───────────────────────────────────────────────────────────
  const sidebar    = el('sidebar');
  const overlay    = el('overlay');
  const hamburger  = el('hamburger');
  const closeSidebarBtn = el('closeSidebar');
  const topbarTitle = el('topbarTitle');

  function openSidebar()  { sidebar.classList.add('open');    overlay.classList.add('show'); }
  function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }

  hamburger.addEventListener('click', openSidebar);
  closeSidebarBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  const toolNames = {
    home:        'Home',
    password:    'Password Generator',
    emi:         'EMI Calculator',
    fd:          'FD Calculator',
    dateconv:    'Bengali Date Converter',
    daycounter:  'Day Counter',
    handwriting: 'Text to Handwriting',
    currency:    'Currency Converter',
  };

  function switchTool(toolId) {
    qsa('.tool-section').forEach(s => s.classList.remove('active'));
    qsa('.nav-item').forEach(n => n.classList.remove('active'));

    const section = el('tool-' + toolId);
    const navItem = el('nav-' + toolId);
    if (section) section.classList.add('active');
    if (navItem) navItem.classList.add('active');

    topbarTitle.textContent = toolNames[toolId] || toolId;
    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Nav links
  qsa('.nav-item').forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      switchTool(this.dataset.tool);
    });
  });

  // Home cards
  qsa('.tool-card').forEach(card => {
    card.addEventListener('click', function () {
      switchTool(this.dataset.tool);
    });
  });

  // ─── TABS ─────────────────────────────────────────────────────────────────
  function initTabs(tabsEl) {
    if (!tabsEl) return;
    const buttons = tabsEl.querySelectorAll('.tab-btn');
    const parent  = tabsEl.parentElement; // the .card
    buttons.forEach(btn => {
      btn.addEventListener('click', function () {
        buttons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        const panel = el(this.dataset.tab + 'Panel');
        if (panel) panel.classList.add('active');
      });
    });
  }

  initTabs(el('dateConvTabs'));
  initTabs(el('dayCounterTabs'));

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  function formatINR(num) {
    return '₹' + Number(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 1. PASSWORD GENERATOR
  // ══════════════════════════════════════════════════════════════════════════
  const pwLengthInput  = el('pwLength');
  const lengthValueEl  = el('lengthValue');
  const passwordOutput = el('passwordOutput');
  const strengthFill   = el('strengthFill');
  const strengthLabel  = el('strengthLabel');
  const copyToast      = el('copyToast');

  if (pwLengthInput) {
    pwLengthInput.addEventListener('input', function () {
      lengthValueEl.textContent = this.value;
    });
  }

  function generatePassword() {
    const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower   = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const ambiguous = /[0O1lI]/g;

    const incUpper = el('incUppercase').checked;
    const incLower = el('incLowercase').checked;
    const incNums  = el('incNumbers').checked;
    const incSyms  = el('incSymbols').checked;
    const excAmb   = el('excludeAmbiguous').checked;
    const length   = parseInt(pwLengthInput.value);

    let charset = '';
    let mandatoryChars = [];

    if (incUpper) { charset += upper;   mandatoryChars.push(upper[Math.floor(Math.random() * upper.length)]); }
    if (incLower) { charset += lower;   mandatoryChars.push(lower[Math.floor(Math.random() * lower.length)]); }
    if (incNums)  { charset += numbers; mandatoryChars.push(numbers[Math.floor(Math.random() * numbers.length)]); }
    if (incSyms)  { charset += symbols; mandatoryChars.push(symbols[Math.floor(Math.random() * symbols.length)]); }

    if (!charset) charset = lower;
    if (excAmb) charset = charset.replace(ambiguous, '');
    if (!charset) charset = lower;

    let password = [...mandatoryChars];
    while (password.length < length) {
      password.push(charset[Math.floor(Math.random() * charset.length)]);
    }
    // Shuffle (Fisher-Yates)
    for (let i = password.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [password[i], password[j]] = [password[j], password[i]];
    }
    return password.slice(0, length).join('');
  }

  function getStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8)  score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { pct: 15,  label: '⚠️ Very Weak',    color: '#ef4444' };
    if (score <= 3) return { pct: 35,  label: '⚠️ Weak',         color: '#f97316' };
    if (score <= 4) return { pct: 55,  label: '✅ Fair',          color: '#f59e0b' };
    if (score <= 5) return { pct: 75,  label: '✅ Strong',        color: '#10b981' };
    return             { pct: 100, label: '🛡️ Very Strong',  color: '#06b6d4' };
  }

  function renderPassword() {
    const pwd = generatePassword();
    passwordOutput.value = pwd;
    const s = getStrength(pwd);
    strengthFill.style.width      = s.pct + '%';
    strengthFill.style.background = s.color;
    strengthLabel.textContent = s.label;
    strengthLabel.style.color  = s.color;
  }

  if (el('generatePassword')) el('generatePassword').addEventListener('click', renderPassword);
  if (el('refreshPassword'))  el('refreshPassword').addEventListener('click', renderPassword);

  if (el('copyPassword')) {
    el('copyPassword').addEventListener('click', function () {
      if (!passwordOutput.value) return;
      navigator.clipboard.writeText(passwordOutput.value).then(function () {
        copyToast.classList.remove('hidden');
        setTimeout(function () { copyToast.classList.add('hidden'); }, 2500);
      }).catch(function () {
        // Fallback for browsers that block clipboard on file://
        passwordOutput.select();
        document.execCommand('copy');
        copyToast.classList.remove('hidden');
        setTimeout(function () { copyToast.classList.add('hidden'); }, 2500);
      });
    });
  }

  // Auto-generate on load
  if (pwLengthInput) renderPassword();

  // ══════════════════════════════════════════════════════════════════════════
  // 2. EMI CALCULATOR
  // ══════════════════════════════════════════════════════════════════════════
  if (el('calcEMI')) {
    el('calcEMI').addEventListener('click', function () {
      const P = parseFloat(el('loanAmount').value);
      const annualRate = parseFloat(el('loanRate').value);
      const n = parseInt(el('loanTenure').value);

      if (!P || !annualRate || !n || P <= 0 || annualRate <= 0 || n <= 0) {
        alert('Please enter valid values for all fields.'); return;
      }

      const r   = annualRate / 12 / 100;
      const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment  = emi * n;
      const totalInterest = totalPayment - P;

      el('emiValue').textContent       = formatINR(emi);
      el('totalPayment').textContent   = formatINR(totalPayment);
      el('totalInterest').textContent  = formatINR(totalInterest);
      el('principalAmount').textContent = formatINR(P);

      el('emiResult').style.display = 'block';
      drawPieChart('emiChart', [
        { value: P,             color: '#6366f1' },
        { value: totalInterest, color: '#f59e0b' }
      ]);

      // Amortization table
      el('amortizationWrap').style.display = 'block';
      const tbody = el('amortizationBody');
      tbody.innerHTML = '';
      let balance = P;
      for (let i = 1; i <= n; i++) {
        const interest  = balance * r;
        const principal = emi - interest;
        balance = Math.max(0, balance - principal);
        tbody.innerHTML += '<tr><td>' + i + '</td><td>' + formatINR(emi) +
          '</td><td>' + formatINR(principal) + '</td><td>' + formatINR(interest) +
          '</td><td>' + formatINR(balance) + '</td></tr>';
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. FD CALCULATOR
  // ══════════════════════════════════════════════════════════════════════════
  if (el('calcFD')) {
    el('calcFD').addEventListener('click', function () {
      const P      = parseFloat(el('fdPrincipal').value);
      const r      = parseFloat(el('fdRate').value) / 100;
      const years  = parseFloat(el('fdYears').value)  || 0;
      const months = parseFloat(el('fdMonths').value) || 0;
      const n      = parseInt(el('fdCompounding').value);
      const taxRate = parseFloat(el('fdTax').value) || 0;
      const t      = years + months / 12;

      if (!P || !r || t <= 0 || P <= 0) { alert('Please enter valid values.'); return; }

      let maturity;
      if (n === 0) {
        maturity = P + P * r * t;           // Simple Interest
      } else {
        maturity = P * Math.pow(1 + r / n, n * t);  // Compound Interest
      }

      const interest = maturity - P;
      const tax      = interest * (taxRate / 100);
      const afterTax = maturity - tax;
      const ear      = (n === 0) ? r : (Math.pow(1 + r / n, n) - 1);

      el('fdMaturity').textContent      = formatINR(maturity);
      el('fdAfterTax').textContent      = formatINR(afterTax);
      el('fdInterest').textContent      = formatINR(interest);
      el('fdTaxAmt').textContent        = formatINR(tax);
      el('fdPrincipalShow').textContent = formatINR(P);
      el('fdEAR').textContent           = (ear * 100).toFixed(2) + '%';

      el('fdResult').style.display = 'block';
      drawPieChart('fdChart', [
        { value: P,            color: '#6366f1' },
        { value: Math.max(0, interest - tax), color: '#f59e0b' },
        { value: tax,          color: '#ef4444' }
      ]);
    });
  }

  // ─── PIE / DONUT CHART ────────────────────────────────────────────────────
  function drawPieChart(canvasId, segments) {
    const canvas = el(canvasId);
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const radius = Math.min(cx, cy) - 10;
    const total  = segments.reduce(function (s, seg) { return s + seg.value; }, 0);
    if (total <= 0) return;

    ctx.clearRect(0, 0, W, H);

    let startAngle = -Math.PI / 2;
    segments.forEach(function (seg) {
      if (seg.value <= 0) return;
      const slice = (seg.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      startAngle += slice;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.55, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0e1a';
    ctx.fill();

    // Center label
    ctx.fillStyle = '#f0f2ff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const pct = ((segments[0].value / total) * 100).toFixed(0);
    ctx.fillText(pct + '% Principal', cx, cy);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. BENGALI DATE CONVERTER
  // ══════════════════════════════════════════════════════════════════════════
  const BN_MONTHS = [
    { bn: 'বৈশাখ',    en: 'Boishakh',   season: { bn: 'গ্রীষ্ম', en: 'Grishmo (Summer)' } },
    { bn: 'জ্যৈষ্ঠ',   en: 'Joishtho',   season: { bn: 'গ্রীষ্ম', en: 'Grishmo (Summer)' } },
    { bn: 'আষাঢ়',    en: 'Asharh',     season: { bn: 'বর্ষা',   en: 'Borsha (Monsoon)' } },
    { bn: 'শ্রাবণ',   en: 'Shrabon',    season: { bn: 'বর্ষা',   en: 'Borsha (Monsoon)' } },
    { bn: 'ভাদ্র',    en: 'Bhadro',     season: { bn: 'শরৎ',    en: 'Shorot (Autumn)' } },
    { bn: 'আশ্বিন',  en: 'Ashwin',     season: { bn: 'শরৎ',    en: 'Shorot (Autumn)' } },
    { bn: 'কার্তিক', en: 'Kartik',     season: { bn: 'হেমন্ত',  en: 'Hemonto (Late Autumn)' } },
    { bn: 'অগ্রহায়ণ', en: 'Agrohayon', season: { bn: 'হেমন্ত',  en: 'Hemonto (Late Autumn)' } },
    { bn: 'পৌষ',     en: 'Poush',      season: { bn: 'শীত',    en: 'Sheet (Winter)' } },
    { bn: 'মাঘ',     en: 'Magh',       season: { bn: 'শীত',    en: 'Sheet (Winter)' } },
    { bn: 'ফাল্গুন', en: 'Falgun',     season: { bn: 'বসন্ত',  en: 'Boshonto (Spring)' } },
    { bn: 'চৈত্র',   en: 'Chaitra',    season: { bn: 'বসন্ত',  en: 'Boshonto (Spring)' } },
  ];

  const BN_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];

  function toBnDigits(num) {
    return String(num).split('').map(function (d) {
      return isNaN(d) ? d : BN_DIGITS[+d];
    }).join('');
  }

  /**
   * Convert a Gregorian Date to Bengali calendar.
   * Uses Bangladesh's official revised calendar (1966/87 reform).
   * Bengali months start on fixed Gregorian dates each year.
   */
  function engToBengali(date) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1; // 1–12
    const d = date.getDate();

    // [gregMonth, gregStartDay, bnMonthIndex]
    // bnMonthIndex: 0=Boishakh … 11=Chaitra
    // These are the Gregorian dates on which each Bengali month STARTS
    const starts = [
      [4,  14,  0],  // Boishakh   starts April 14
      [5,  15,  1],  // Joishtho   starts May 15
      [6,  15,  2],  // Asharh     starts June 15
      [7,  16,  3],  // Shrabon    starts July 16
      [8,  16,  4],  // Bhadro     starts Aug 16
      [9,  16,  5],  // Ashwin     starts Sep 16
      [10, 17,  6],  // Kartik     starts Oct 17
      [11, 16,  7],  // Agrohayon  starts Nov 16
      [12, 16,  8],  // Poush      starts Dec 16
      [1,  14,  9],  // Magh       starts Jan 14 (next year's greg year)
      [2,  13, 10],  // Falgun     starts Feb 13
      [3,  14, 11],  // Chaitra    starts Mar 14
    ];

    let bnMonth = -1;
    let bnDay   = -1;
    let bnYear;

    // Find which Bengali month we're in
    // We compare (m, d) with all start dates, pick the last one that is <= (m, d)
    // Bengali year: for Boishakh–Poush (bnMonth 0–8) = gregYear - 593
    //               for Magh–Chaitra (bnMonth 9–11) in Jan–Mar = gregYear - 594

    // Convert date to a comparable number: month*100 + day
    const md = m * 100 + d;

    for (let i = starts.length - 1; i >= 0; i--) {
      const sm = starts[i][0];
      const sd = starts[i][1];
      const smd = sm * 100 + sd;

      // Handle year wrap: Magh(Jan), Falgun(Feb), Chaitra(Mar) have gregMonth < Boishakh
      // so we need to handle the case where we're in Jan/Feb/Mar looking at Jan/Feb/Mar starts
      // and also Oct-Dec months looking at Oct-Dec starts

      let effectiveSmd = smd;
      // If the start month is Jan/Feb/Mar (months 1,2,3) and current month is Oct/Nov/Dec,
      // treat it as a future start — skip
      if (sm <= 3 && m >= 4) continue;
      // If the start month is Apr-Dec and current month is Jan-Mar, skip
      if (sm >= 4 && m <= 3) continue;

      if (md >= smd) {
        bnMonth = starts[i][2];
        bnDay   = d - sd + 1;
        break;
      }
    }

    // If bnMonth not found, we're in Jan-Mar (Magh/Falgun/Chaitra)
    if (bnMonth === -1) {
      for (let i = starts.length - 1; i >= 0; i--) {
        const sm = starts[i][0];
        const sd = starts[i][1];
        if (sm > 3) continue; // Only look at Jan/Feb/Mar starts
        const smd = sm * 100 + sd;
        if (md >= smd) {
          bnMonth = starts[i][2];
          bnDay   = d - sd + 1;
          break;
        }
      }
      // Still not found means we're before Magh (before Jan 14) — in Poush (Dec 16–Jan 13)
      if (bnMonth === -1) {
        bnMonth = 8; // Poush
        bnDay   = d + (31 - 16 + 1); // days since Dec 16
      }
    }

    // Calculate Bengali year
    if (bnMonth >= 0 && bnMonth <= 8) {
      // Boishakh to Poush: same as Gregorian year - 593
      // (if we're in Apr-Dec)
      bnYear = (m >= 4) ? y - 593 : y - 594;
    } else {
      // Magh, Falgun, Chaitra (Jan, Feb, Mar): Gregorian year - 594
      bnYear = y - 594;
    }

    return {
      bnYear,
      bnMonth,
      bnDay: Math.max(1, bnDay),
      monthData: BN_MONTHS[bnMonth] || BN_MONTHS[0]
    };
  }

  // Show today's Bengali date in the Today card
  function initTodayDates() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Pre-fill the date input
    const engDateInput = el('engDate');
    if (engDateInput) engDateInput.value = todayStr;

    // Today English
    const todayEnEl = el('todayEnglish');
    if (todayEnEl) {
      todayEnEl.textContent = today.toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    // Today Bengali
    const todayBnEl = el('todayBengali');
    if (todayBnEl) {
      try {
        const bn = engToBengali(today);
        todayBnEl.textContent = toBnDigits(bn.bnDay) + ' ' + bn.monthData.bn + ' ' + toBnDigits(bn.bnYear);
      } catch (e) {
        todayBnEl.textContent = 'কার্তিক ১৪৩১';
      }
    }
  }

  initTodayDates();

  // English → Bengali convert button
  if (el('convertEng2Ben')) {
    el('convertEng2Ben').addEventListener('click', function () {
      const dateStr = el('engDate').value;
      if (!dateStr) { alert('Please select a date.'); return; }

      try {
        const date = new Date(dateStr + 'T00:00:00');
        const bn   = engToBengali(date);

        el('bengaliDateBn').textContent  = toBnDigits(bn.bnDay) + ' ' + bn.monthData.bn + ' ' + toBnDigits(bn.bnYear);
        el('bengaliDateEn').textContent  = bn.bnDay + ' ' + bn.monthData.en + ' ' + bn.bnYear;
        el('bengaliMonth').textContent   = bn.monthData.bn + ' (' + bn.monthData.en + ')';
        el('bengaliSeason').textContent  = bn.monthData.season.bn + ' – ' + bn.monthData.season.en;
        el('bengaliDateResult').style.display = 'block';
      } catch (e) {
        alert('Could not convert date. Please try a different date.');
      }
    });
  }

  // Bengali → English convert button
  if (el('convertBen2Eng')) {
    el('convertBen2Eng').addEventListener('click', function () {
      const bnYear  = parseInt(el('benYear').value);
      const bnMonth = parseInt(el('benMonth').value); // 1–12
      const bnDay   = parseInt(el('benDay').value);

      if (!bnYear || !bnDay || isNaN(bnMonth)) { alert('Please fill all fields.'); return; }

      // Gregorian start dates for each Bengali month (month index 1–12)
      const bnToGreg = [
        null,
        { gm: 4,  gd: 14 },  // 1: Boishakh → April 14
        { gm: 5,  gd: 15 },  // 2: Joishtho → May 15
        { gm: 6,  gd: 15 },  // 3: Asharh   → June 15
        { gm: 7,  gd: 16 },  // 4: Shrabon  → July 16
        { gm: 8,  gd: 16 },  // 5: Bhadro   → Aug 16
        { gm: 9,  gd: 16 },  // 6: Ashwin   → Sep 16
        { gm: 10, gd: 17 },  // 7: Kartik   → Oct 17
        { gm: 11, gd: 16 },  // 8: Agrohayon→ Nov 16
        { gm: 12, gd: 16 },  // 9: Poush    → Dec 16
        { gm: 1,  gd: 14 },  //10: Magh     → Jan 14
        { gm: 2,  gd: 13 },  //11: Falgun   → Feb 13
        { gm: 3,  gd: 14 },  //12: Chaitra  → Mar 14
      ];

      const ref = bnToGreg[bnMonth];
      if (!ref) { alert('Invalid month.'); return; }

      // Determine Gregorian year
      let gregYear;
      if (bnMonth <= 9) {
        gregYear = bnYear + 593; // Apr–Dec
      } else {
        gregYear = bnYear + 594; // Jan–Mar (Magh, Falgun, Chaitra)
      }

      const baseDate   = new Date(gregYear, ref.gm - 1, ref.gd);
      const resultDate = new Date(baseDate.getTime() + (bnDay - 1) * 86400000);

      const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      el('englishDateValue').textContent = resultDate.toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      el('englishDayOfWeek').textContent = dayNames[resultDate.getDay()];
      el('englishDateResult').style.display = 'block';
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5. DAY COUNTER
  // ══════════════════════════════════════════════════════════════════════════
  (function () {
    const today    = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (el('startDate'))      el('startDate').value      = today;
    if (el('endDate'))        el('endDate').value        = tomorrow;
    if (el('targetDate'))     el('targetDate').value     = tomorrow;
    if (el('addSubStartDate')) el('addSubStartDate').value = today;
  })();

  if (el('calcDaysBetween')) {
    el('calcDaysBetween').addEventListener('click', function () {
      const start = new Date(el('startDate').value + 'T00:00:00');
      const end   = new Date(el('endDate').value   + 'T00:00:00');
      if (isNaN(start) || isNaN(end)) { alert('Please select both dates.'); return; }

      const excludeWknd = el('excludeWeekends').checked;
      const includeEnd  = el('includeEndDate').checked;

      const d1 = start < end ? start : end;
      const d2 = start < end ? end   : start;

      let totalDays = Math.round((d2 - d1) / 86400000);
      if (includeEnd) totalDays += 1;

      let weekdays = 0, weekends = 0;
      let cursor = new Date(d1);
      const limit = new Date(d2);
      if (includeEnd) limit.setDate(limit.getDate() + 1);
      while (cursor < limit) {
        const day = cursor.getDay();
        if (day === 0 || day === 6) weekends++;
        else weekdays++;
        cursor.setDate(cursor.getDate() + 1);
      }

      const displayDays = excludeWknd ? weekdays : totalDays;

      el('totalDays').textContent    = displayDays.toLocaleString();
      el('weeksAndDays').textContent = Math.floor(displayDays / 7) + 'w ' + (displayDays % 7) + 'd';
      el('weekdaysCount').textContent = weekdays.toLocaleString();
      el('weekendsCount').textContent = weekends.toLocaleString();
      el('monthsCount').textContent   = (totalDays / 30.44).toFixed(1);
      el('yearsCount').textContent    = (totalDays / 365.25).toFixed(2);
      el('daysBetweenResult').style.display = 'block';
    });
  }

  if (el('calcFromToday')) {
    el('calcFromToday').addEventListener('click', function () {
      const target = new Date(el('targetDate').value + 'T00:00:00');
      const today  = new Date(); today.setHours(0, 0, 0, 0);
      if (isNaN(target)) { alert('Please select a date.'); return; }

      const diff    = Math.round((target - today) / 86400000);
      const absDiff = Math.abs(diff);

      el('daysFromToday').textContent  = absDiff.toLocaleString();
      el('futureOrPast').textContent   = diff > 0 ? '⏩ In the future' : diff < 0 ? '⏪ In the past' : '📌 Today!';
      el('weeksFromToday').textContent = (absDiff / 7).toFixed(1);
      el('monthsFromToday').textContent = (absDiff / 30.44).toFixed(1);
      el('fromTodayResult').style.display = 'block';
    });
  }

  if (el('calcAddSub')) {
    el('calcAddSub').addEventListener('click', function () {
      const start = new Date(el('addSubStartDate').value + 'T00:00:00');
      const days  = parseInt(el('daysToAddSub').value);
      const op    = el('addSubOp').value;
      if (isNaN(start) || isNaN(days)) { alert('Please fill all fields.'); return; }

      const result  = new Date(start.getTime() + (op === 'add' ? 1 : -1) * days * 86400000);
      const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

      el('addSubResultDate').textContent  = result.toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      el('addSubDayOfWeek').textContent = dayNames[result.getDay()];
      el('addSubResult').style.display = 'block';
    });
  }

  // Live clock
  function startLiveClock() {
    const clockEl = el('liveClock');
    const dateEl  = el('liveDate');
    if (!clockEl) return;

    function tick() {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('en-IN', { hour12: false });
      if (dateEl) dateEl.textContent = now.toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }
    tick();
    setInterval(tick, 1000);
  }
  startLiveClock();

  // ══════════════════════════════════════════════════════════════════════════
  // 6. TEXT TO HANDWRITING
  // ══════════════════════════════════════════════════════════════════════════
  if (el('hwSize')) {
    el('hwSize').addEventListener('input', function () {
      el('hwSizeVal').textContent = this.value;
    });
  }

  if (el('hwSpacing')) {
    el('hwSpacing').addEventListener('input', function () {
      el('hwSpacingVal').textContent = this.value;
    });
  }

  if (el('generateHandwriting')) {
    el('generateHandwriting').addEventListener('click', function () {
      const text        = el('hwText').value || 'Type some text above and click Generate!';
      const fontValue   = el('hwFont').value;
      const color       = el('hwColor').value;
      const size        = parseInt(el('hwSize').value);
      const bg          = el('hwBackground').value;
      const lineSpacing = parseFloat(el('hwSpacing').value);

      const canvas    = el('hwCanvas');
      const padding   = 60;
      const lineHeight = Math.round(size * lineSpacing);
      const maxWidth   = 760;

      canvas.width = maxWidth + padding * 2;
      const ctx = canvas.getContext('2d');

      // Extract font name (strip quotes)
      const fontName = fontValue.replace(/'/g, '').split(',')[0].trim();
      ctx.font = size + 'px "' + fontName + '", cursive';

      // Word-wrap
      const paragraphs = text.split('\n');
      const lines = [];
      paragraphs.forEach(function (para) {
        if (para.trim() === '') { lines.push(''); return; }
        const words = para.split(' ');
        let currentLine = '';
        words.forEach(function (word) {
          const test = currentLine ? currentLine + ' ' + word : word;
          if (ctx.measureText(test).width > maxWidth) {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = test;
          }
        });
        if (currentLine) lines.push(currentLine);
      });

      canvas.height = padding * 2 + (lines.length + 1) * lineHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      if (bg === 'ruled' || bg === 'yellow-ruled') {
        ctx.fillStyle = (bg === 'yellow-ruled') ? '#fdfde7' : '#fefefe';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = (bg === 'yellow-ruled') ? '#d0c88a' : '#b8cfe8';
        ctx.lineWidth = 1;
        for (let y = padding; y <= canvas.height; y += lineHeight) {
          ctx.beginPath();
          ctx.moveTo(0, y + size * 0.8);
          ctx.lineTo(canvas.width, y + size * 0.8);
          ctx.stroke();
        }
        // Red margin
        ctx.strokeStyle = '#ffaaaa';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padding - 10, 0);
        ctx.lineTo(padding - 10, canvas.height);
        ctx.stroke();
      } else if (bg === 'grid') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#dde8f0';
        ctx.lineWidth = 0.8;
        const gs = lineHeight / 2;
        for (let x = 0; x < canvas.width; x += gs) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gs) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw text
      ctx.font = size + 'px "' + fontName + '", cursive';
      ctx.fillStyle    = color;
      ctx.textBaseline = 'alphabetic';

      lines.forEach(function (line, i) {
        ctx.fillText(line, padding, padding + (i + 1) * lineHeight);
      });

      el('hwOutputCard').style.display = 'block';
    });
  }

  if (el('downloadHandwriting')) {
    el('downloadHandwriting').addEventListener('click', function () {
      const canvas = el('hwCanvas');
      if (!canvas || !canvas.width) { alert('Please generate handwriting first.'); return; }
      const link = document.createElement('a');
      link.download = 'handwriting.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 7. CURRENCY CONVERTER
  // ══════════════════════════════════════════════════════════════════════════
  const CURRENCIES = [
    { code: 'USD', name: 'US Dollar',           flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro',                flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound',       flag: '🇬🇧' },
    { code: 'INR', name: 'Indian Rupee',        flag: '🇮🇳' },
    { code: 'JPY', name: 'Japanese Yen',        flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar',     flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar',   flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc',         flag: '🇨🇭' },
    { code: 'CNY', name: 'Chinese Yuan',        flag: '🇨🇳' },
    { code: 'SGD', name: 'Singapore Dollar',    flag: '🇸🇬' },
    { code: 'AED', name: 'UAE Dirham',          flag: '🇦🇪' },
    { code: 'SAR', name: 'Saudi Riyal',         flag: '🇸🇦' },
    { code: 'MYR', name: 'Malaysian Ringgit',   flag: '🇲🇾' },
    { code: 'HKD', name: 'Hong Kong Dollar',    flag: '🇭🇰' },
    { code: 'KRW', name: 'South Korean Won',    flag: '🇰🇷' },
    { code: 'BDT', name: 'Bangladeshi Taka',    flag: '🇧🇩' },
    { code: 'PKR', name: 'Pakistani Rupee',     flag: '🇵🇰' },
    { code: 'LKR', name: 'Sri Lankan Rupee',    flag: '🇱🇰' },
    { code: 'NZD', name: 'New Zealand Dollar',  flag: '🇳🇿' },
    { code: 'NOK', name: 'Norwegian Krone',     flag: '🇳🇴' },
    { code: 'SEK', name: 'Swedish Krona',       flag: '🇸🇪' },
    { code: 'DKK', name: 'Danish Krone',        flag: '🇩🇰' },
    { code: 'THB', name: 'Thai Baht',           flag: '🇹🇭' },
    { code: 'MXN', name: 'Mexican Peso',        flag: '🇲🇽' },
    { code: 'BRL', name: 'Brazilian Real',      flag: '🇧🇷' },
    { code: 'ZAR', name: 'South African Rand',  flag: '🇿🇦' },
    { code: 'TRY', name: 'Turkish Lira',        flag: '🇹🇷' },
    { code: 'IDR', name: 'Indonesian Rupiah',   flag: '🇮🇩' },
    { code: 'PHP', name: 'Philippine Peso',     flag: '🇵🇭' },
  ];

  // Fallback rates (USD base, approximate)
  const FALLBACK = {
    USD:1, EUR:0.92, GBP:0.79, INR:83.5, JPY:149.5, CAD:1.36,
    AUD:1.53, CHF:0.88, CNY:7.29, SGD:1.34, AED:3.67, SAR:3.75,
    MYR:4.72, HKD:7.82, KRW:1340, BDT:110, PKR:278, LKR:325,
    NZD:1.63, NOK:10.6, SEK:10.45, DKK:6.88, THB:35.2, MXN:17.1,
    BRL:5.04, ZAR:18.8, TRY:32.5, IDR:15700, PHP:56.5,
  };

  let liveRates = null;

  const fromSel = el('fromCurrency');
  const toSel   = el('toCurrency');

  if (fromSel && toSel) {
    CURRENCIES.forEach(function (c) {
      const label = c.flag + ' ' + c.code + ' – ' + c.name;
      fromSel.appendChild(new Option(label, c.code));
      toSel.appendChild(new Option(label, c.code));
    });
    fromSel.value = 'USD';
    toSel.value   = 'INR';

    // Try to fetch live rates
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.rates) {
          liveRates = data.rates;
          liveRates['USD'] = 1;
        }
      })
      .catch(function () { /* Use fallback silently */ });

    el('swapCurrency').addEventListener('click', function () {
      const tmp = fromSel.value;
      fromSel.value = toSel.value;
      toSel.value   = tmp;
    });

    el('convertCurrency').addEventListener('click', function () {
      const amount = parseFloat(el('currencyAmount').value);
      const from   = fromSel.value;
      const to     = toSel.value;
      if (isNaN(amount) || amount < 0) { alert('Enter a valid amount.'); return; }

      const rates    = liveRates || FALLBACK;
      const isLive   = !!liveRates;
      const fromRate = rates[from] || FALLBACK[from] || 1;
      const toRate   = rates[to]   || FALLBACK[to]   || 1;
      const result   = (amount / fromRate) * toRate;
      const unitRate = (1 / fromRate) * toRate;

      const fromCur = CURRENCIES.find(function (c) { return c.code === from; });
      const toCur   = CURRENCIES.find(function (c) { return c.code === to; });

      el('currencyResultMain').textContent = amount.toLocaleString() + ' ' + from + ' = ' +
        result.toLocaleString(undefined, { maximumFractionDigits: 4 }) + ' ' + to;
      el('currencyResultRate').textContent = '1 ' + from + ' = ' + unitRate.toFixed(4) + ' ' + to +
        '  |  1 ' + to + ' = ' + (1 / unitRate).toFixed(4) + ' ' + from;
      el('currencyResultTime').textContent = (isLive ? '🟢 Live rates' : '🟡 Cached rates') +
        ' • ' + new Date().toLocaleTimeString();
      el('currencyError').style.display = isLive ? 'none' : 'block';
      el('currencyResult').style.display = 'block';

      // Quick table
      const amts  = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 5000];
      const tbody = el('quickConvertBody');
      tbody.innerHTML = '';
      amts.forEach(function (a) {
        const val = (a / fromRate) * toRate;
        tbody.innerHTML += '<tr><td>' + a.toLocaleString() + '</td><td>' +
          (fromCur ? fromCur.flag + ' ' : '') + a.toLocaleString() + ' ' + from +
          '</td><td>' + (toCur ? toCur.flag + ' ' : '') +
          val.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' ' + to + '</td></tr>';
      });
      el('fromHeader').textContent = from;
      el('toHeader').textContent   = to;
      el('quickConvertCard').style.display = 'block';

      // Popular currencies
      el('popularBase').textContent = from;
      const popularCodes = ['USD','EUR','GBP','INR','JPY','AED','BDT','SGD'];
      const grid = el('popularGrid');
      grid.innerHTML = '';
      popularCodes.forEach(function (code) {
        if (code === from) return;
        const r = rates[code] || FALLBACK[code] || 1;
        const conv = (1 / fromRate) * r;
        const cur  = CURRENCIES.find(function (c) { return c.code === code; });
        grid.innerHTML += '<div class="popular-item">' +
          '<div class="popular-item-flag">' + (cur ? cur.flag : '') + '</div>' +
          '<div class="popular-item-code">' + code + '</div>' +
          '<div class="popular-item-rate">' + conv.toLocaleString(undefined, { maximumFractionDigits: 3 }) + '</div>' +
          '</div>';
      });
    });
  }

}); // END DOMContentLoaded
