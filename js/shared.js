// ═══════════════════════════════════════════
//         SHARED COURSE FUNCTIONS
// ═══════════════════════════════════════════
var lang = 'en';
var attempts = {};
var answered = {};

function announce(msg) {
  var el = document.getElementById('aria-live');
  if (el) el.textContent = msg;
}

// ═══════════════════════════════════════════
//             LANGUAGE TOGGLE
// ═══════════════════════════════════════════
function toggleLang() {
  lang = lang === 'en' ? 'es' : 'en';
  const btn = document.getElementById('lang-toggle');
  btn.textContent = lang === 'en' ? '🌐 Español' : '🌐 English';
  document.querySelectorAll('[data-en]').forEach(el => {
    el.innerHTML = el.getAttribute('data-' + lang);
  });
}

// TABS
function switchTab(btn, panelId, groupId) {
  var group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  var container = btn.closest('.tab-btns') || btn.parentElement;
  container.querySelectorAll('.tab-btn').forEach(b => b.setAttribute('aria-selected','false'));
  btn.setAttribute('aria-selected','true');
  var panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
}

// MULTIPLE CHOICE
function checkMC(qid, selected, correct, explanation) {
  if (answered[qid]) return;
  answered[qid] = true;
  var btns = document.querySelectorAll('[data-q="' + qid + '"]');
  btns.forEach(function(b) {
    b.disabled = true;
    var val = b.dataset.val;
    if (val === correct) { b.classList.add('correct'); b.querySelector('.option-icon').textContent = '✅'; }
    else if (val === selected) { b.classList.add('incorrect'); b.querySelector('.option-icon').textContent = '❌'; }
  });
  var fb = document.getElementById(qid + '-feedback');
  if (selected === correct) {
    if (fb) { fb.className = 'feedback-box correct show'; fb.innerHTML = '<span class="feedback-icon">✅</span><span><strong>Correct!</strong> ' + explanation + '</span>'; }
    awardPoint(qid);
    announce('Correct! ' + explanation);
  } else {
    if (fb) { fb.className = 'feedback-box incorrect show'; fb.innerHTML = '<span class="feedback-icon">❌</span><span>' + explanation + '</span>'; }
    announce('Incorrect. ' + explanation);
  }
}

// FILL-IN
function checkFill(qid, correct, explanation, hint) {
  var input = document.getElementById(qid + '-in');
  var fb = document.getElementById(qid + '-feedback');
  var attEl = document.getElementById(qid + '-att');
  if (!input || input.disabled) return;
  if (!attempts[qid]) attempts[qid] = 0;
  attempts[qid]++;
  var userVal = input.value.trim().toLowerCase().replace(/\s+/g,'');
  var correctNorm = correct.toLowerCase().replace(/\s+/g,'');
  var isRight = userVal === correctNorm;
  if (isRight) {
    fb.className = 'feedback-box correct show';
    fb.innerHTML = '<span class="feedback-icon">✅</span><span><strong>Correct!</strong> ' + explanation + '</span>';
    awardPoint(qid);
    input.disabled = true; input.style.borderColor = '#166534';
    if (attEl) attEl.textContent = '✓ Correct!';
    announce('Correct! ' + explanation);
  } else if (attempts[qid] === 1) {
    fb.className = 'feedback-box hint show';
    fb.innerHTML = '<span class="feedback-icon">💡</span><span>' + hint + '</span>';
    if (attEl) attEl.textContent = 'Attempts: 1';
    announce('Incorrect. ' + hint);
  } else {
    fb.className = 'feedback-box incorrect show';
    fb.innerHTML = '<span class="feedback-icon">❌</span><span>Answer: <strong>' + correct + '</strong>. ' + explanation + '</span>';
    answered[qid] = 'no-point';
    input.disabled = true; input.style.borderColor = '#991b1b';
    if (attEl) attEl.textContent = 'No more attempts.';
    announce('The correct answer is ' + correct);
  }
}

// POINTS
var modulePoints = {};
var totalPoints = 0;

function awardPoint(qid) {
  if (answered[qid + '_scored']) return;
  answered[qid + '_scored'] = true;
  totalPoints++;
  updateScoreBar();
}

function updateScoreBar() {
  var maxPoints = parseInt(document.getElementById('score-max') ? document.getElementById('score-max').textContent : 10) || 10;
  var scoreEl = document.getElementById('score-num');
  var fillEl = document.getElementById('progress-fill');
  if (scoreEl) scoreEl.textContent = totalPoints;
  if (fillEl) fillEl.style.width = Math.min(100, (totalPoints / maxPoints) * 100) + '%';
  var progressBar = document.querySelector('.progress-bar-wrap');
  if (progressBar) progressBar.setAttribute('aria-valuenow', totalPoints);
}

// LIVE PREVIEW
function livePreview(editorId, outputId) {
  var code = document.getElementById(editorId).value;
  var out = document.getElementById(outputId);
  if (!out) return;
  var iframe = out.querySelector('iframe');
  if (!iframe) { iframe = document.createElement('iframe'); out.appendChild(iframe); }
  var doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open(); doc.write(code); doc.close();
  iframe.style.height = Math.max(120, doc.body ? doc.body.scrollHeight + 20 : 120) + 'px';
}

// CSS PREVIEW
function cssPreview(htmlId, cssId, outputId) {
  var html = document.getElementById(htmlId).value;
  var css = document.getElementById(cssId).value;
  var out = document.getElementById(outputId);
  if (!out) return;
  var iframe = out.querySelector('iframe');
  if (!iframe) { iframe = document.createElement('iframe'); out.appendChild(iframe); }
  var doc = iframe.contentDocument || iframe.contentWindow.document;
  var full = '<!DOCTYPE html><html><head><style>' + css + '</style></head><body>' + html + '</body></html>';
  doc.open(); doc.write(full); doc.close();
  iframe.style.height = Math.max(120, doc.body ? doc.body.scrollHeight + 20 : 120) + 'px';
}

window.addEventListener('load', updateScoreBar);