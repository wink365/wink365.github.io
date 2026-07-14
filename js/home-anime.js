(function () {
  if (!document.body.classList.contains("home-page")) {
    return;
  }

  var tracks = [
    { title: "Neon Little World", mood: "Synth Pop", tempo: 140, wave: "triangle", notes: [523.25, 659.25, 783.99, 659.25, 587.33, 739.99, 880.00, 739.99] },
    { title: "Moonlight Coding", mood: "Lo-Fi", tempo: 112, wave: "sine", notes: [440.00, 493.88, 587.33, 659.25, 587.33, 493.88, 440.00, 392.00] },
    { title: "Arcade Dream", mood: "8-Bit", tempo: 156, wave: "square", notes: [392.00, 523.25, 587.33, 783.99, 698.46, 587.33, 523.25, 392.00] },
    { title: "Sakura Terminal", mood: "Chill", tempo: 124, wave: "triangle", notes: [493.88, 587.33, 659.25, 739.99, 659.25, 587.33, 554.37, 493.88] },
    { title: "Pixel Stargazer", mood: "Dream", tempo: 132, wave: "sine", notes: [587.33, 739.99, 880.00, 987.77, 880.00, 783.99, 659.25, 739.99] }
  ];

  var live2dModels = [
    { name: "Shizuku", path: "https://cdn.jsdelivr.net/npm/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json" },
    { name: "Hijiki", path: "https://cdn.jsdelivr.net/npm/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json" },
    { name: "Tororo", path: "https://cdn.jsdelivr.net/npm/live2d-widget-model-tororo@1.0.5/assets/tororo.model.json" },
    { name: "Koharu", path: "https://cdn.jsdelivr.net/npm/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json" },
    { name: "Haruto", path: "https://cdn.jsdelivr.net/npm/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json" },
    { name: "Wanko", path: "https://cdn.jsdelivr.net/npm/live2d-widget-model-wanko@1.0.5/assets/wanko.model.json" }
  ];

  var player = document.getElementById("anime-music");
  var title = document.getElementById("anime-track-title");
  var playlist = document.getElementById("anime-playlist");
  var toggle = player && player.querySelector(".anime-music-toggle");
  var prev = player && player.querySelector(".anime-music-prev");
  var next = player && player.querySelector(".anime-music-next");
  var listToggle = player && player.querySelector(".anime-list-toggle");
  var live2dFrame = document.getElementById("live2d-frame");
  var modelList = document.getElementById("live2d-model-list");
  var modelPanel = document.getElementById("live2d-switcher");
  var modelToggle = document.querySelector(".live2d-toggle");
  var audioContext;
  var masterGain;
  var timer;
  var trackIndex = 0;
  var modelIndex = 0;
  var step = 0;
  var playing = false;

  function ensureAudio() {
    var AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      return false;
    }

    if (!audioContext) {
      audioContext = new AudioCtor();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.055;
      masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    return true;
  }

  function playNote(frequency, duration, wave) {
    if (!audioContext || !masterGain) {
      return;
    }

    var now = audioContext.currentTime;
    var osc = audioContext.createOscillator();
    var gain = audioContext.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.8, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.03);

    if (step % 4 === 0) {
      var bass = audioContext.createOscillator();
      var bassGain = audioContext.createGain();
      bass.type = "sine";
      bass.frequency.setValueAtTime(frequency / 2, now);
      bassGain.gain.setValueAtTime(0.0001, now);
      bassGain.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 1.4);
      bass.connect(bassGain);
      bassGain.connect(masterGain);
      bass.start(now);
      bass.stop(now + duration * 1.4 + 0.03);
    }
  }

  function tick() {
    var track = tracks[trackIndex];
    var beat = 60000 / track.tempo;
    playNote(track.notes[step % track.notes.length], beat / 1000 * 0.82, track.wave);
    step += 1;
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function renderPlaylist() {
    if (!playlist) {
      return;
    }

    playlist.innerHTML = "";
    tracks.forEach(function (track, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = index === trackIndex ? "is-active" : "";
      button.setAttribute("aria-current", index === trackIndex ? "true" : "false");
      button.innerHTML = "<span>" + track.title + "</span><small>" + track.mood + "</small>";
      button.addEventListener("click", function () {
        setTrack(index);
        setPlaylistOpen(false);
      });
      playlist.appendChild(button);
    });
  }

  function refreshTrack() {
    title.textContent = tracks[trackIndex].title;
    step = 0;
    renderPlaylist();
  }

  function start() {
    if (!ensureAudio()) {
      title.textContent = "Audio unavailable";
      return;
    }

    stopTimer();
    playing = true;
    player.classList.add("is-playing");
    toggle.textContent = "❚❚";
    toggle.setAttribute("aria-label", "暂停音乐");
    tick();
    timer = window.setInterval(tick, 60000 / tracks[trackIndex].tempo);
  }

  function pause() {
    playing = false;
    stopTimer();
    player.classList.remove("is-playing");
    toggle.textContent = "▶";
    toggle.setAttribute("aria-label", "播放音乐");
  }

  function setTrack(index) {
    trackIndex = index;
    refreshTrack();
    if (playing) {
      start();
    }
  }

  function switchTrack(offset) {
    setTrack((trackIndex + offset + tracks.length) % tracks.length);
  }

  function setPlaylistOpen(open) {
    if (!player || !listToggle) {
      return;
    }

    player.classList.toggle("is-list-open", open);
    listToggle.classList.toggle("is-open", open);
    listToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function renderModelList() {
    if (!modelList) {
      return;
    }

    modelList.innerHTML = "";
    live2dModels.forEach(function (model, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = model.name;
      button.className = index === modelIndex ? "is-active" : "";
      button.setAttribute("aria-current", index === modelIndex ? "true" : "false");
      button.addEventListener("click", function () {
        setLive2DModel(index);
        setModelPanelOpen(false);
      });
      modelList.appendChild(button);
    });
  }

  function setModelPanelOpen(open) {
    if (!modelPanel || !modelToggle) {
      return;
    }

    modelPanel.classList.toggle("is-open", open);
    modelToggle.classList.toggle("is-open", open);
    modelToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function setLive2DModel(index) {
    if (!live2dFrame) {
      return;
    }

    modelIndex = index;
    renderModelList();
    document.body.classList.remove("live2d-ready");
    live2dFrame.src = "/live2d-frame.html?model=" + encodeURIComponent(live2dModels[modelIndex].path) + "&v=" + Date.now();
  }

  if (player && title && toggle && prev && next && listToggle) {
    refreshTrack();
    toggle.addEventListener("click", function () {
      if (playing) {
        pause();
      } else {
        start();
      }
    });
    prev.addEventListener("click", function () {
      switchTrack(-1);
    });
    next.addEventListener("click", function () {
      switchTrack(1);
    });
    listToggle.addEventListener("click", function () {
      setPlaylistOpen(!player.classList.contains("is-list-open"));
    });
  }

  if (modelToggle && modelPanel && live2dFrame) {
    renderModelList();
    setLive2DModel(0);
    modelToggle.addEventListener("click", function () {
      setModelPanelOpen(!modelPanel.classList.contains("is-open"));
    });
    live2dFrame.addEventListener("load", function () {
      document.body.classList.add("live2d-ready");
    });
  }

  window.addEventListener("message", function (event) {
    if (event.origin === window.location.origin && event.data && event.data.type === "live2d-ready") {
      document.body.classList.add("live2d-ready");
    }
  });

  document.addEventListener("click", function (event) {
    if (player && !player.contains(event.target)) {
      setPlaylistOpen(false);
    }
    if (modelPanel && modelToggle && !modelPanel.contains(event.target) && !modelToggle.contains(event.target)) {
      setModelPanelOpen(false);
    }
  });
})();
