/**
 * About-page language switcher.
 * Default block is SSG-visible (`DEFAULT_KON_INDEX` / `data-default-lang-index`).
 * Client only re-paints when navigator.language prefers another block, or on tab/select change.
 */

interface AboutWindow extends Window {
    __aboutAPlayer?: {
        audio?: HTMLAudioElement;
    };
}

function initFilmTrack(container: HTMLElement): void {
    const canvas = container.querySelector<HTMLCanvasElement>(".kon-film-track-left");
    if (!canvas) {
        return;
    }
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) {
        return;
    }

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;

    let audioCtx: AudioContext | null = null;
    let analyserL: AnalyserNode | null = null;
    let analyserR: AnalyserNode | null = null;
    let freqDataL: Uint8Array<ArrayBuffer> | null = null;
    let freqDataR: Uint8Array<ArrayBuffer> | null = null;
    let connectedAudio: HTMLAudioElement | null = null;
    let waveHistoryL: number[] = [];
    let waveHistoryR: number[] = [];
    let phaseStep = 0;
    let scrollAccum = 0;

    const resize = (): void => {
        const rect = canvas.getBoundingClientRect();
        dpr = window.devicePixelRatio || 1;
        width = Math.max(1, Math.round(rect.width));
        height = Math.max(1, Math.round(rect.height));
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawRoundedRect = (
        x: number,
        y: number,
        w: number,
        h: number,
        r: number
    ): void => {
        ctx2d.beginPath();
        ctx2d.roundRect(x, y, w, h, r);
    };

    const renderFrame = (isPlaying: boolean): void => {
        if (width === 0 || height === 0) {
            return;
        }

        const sprocketColW = Math.round(width * (30 / 54));
        const metalW = Math.round(width * (6 / 54));
        const cyanX = sprocketColW + metalW;
        const cyanW = width - cyanX;
        const tileH = Math.max(20, Math.round(sprocketColW * (28 / 30)));
        const holeW = Math.round(sprocketColW * 0.6);
        const holeH = Math.round(tileH * 0.5);
        const holeX = Math.round((sprocketColW - holeW) / 2);

        // Update live audio spectrum buffers when playing
        if (isPlaying && analyserL && analyserR && freqDataL && freqDataR) {
            analyserL.getByteFrequencyData(freqDataL);
            analyserR.getByteFrequencyData(freqDataR);
        }

        // 1. Beige film edge base
        ctx2d.fillStyle = "#ede9dc";
        ctx2d.fillRect(0, 0, sprocketColW, height);

        // 2. Static sprocket holes
        const tileCount = Math.ceil(height / tileH) + 1;
        const holeOffsetY = Math.round((tileH - holeH) / 2);

        for (let t = 0; t < tileCount; t += 1) {
            const tileY = t * tileH;
            drawRoundedRect(holeX, tileY + holeOffsetY, holeW, holeH, 3);
            ctx2d.fillStyle = "#ffffff";
            ctx2d.fill();
            ctx2d.strokeStyle = "#c8c2b2";
            ctx2d.lineWidth = 1;
            ctx2d.stroke();
        }

        // 3. Metallic optical edge track
        const metalGrad = ctx2d.createLinearGradient(sprocketColW, 0, cyanX, 0);
        metalGrad.addColorStop(0, "#b5b5af");
        metalGrad.addColorStop(0.5, "#d4d4ce");
        metalGrad.addColorStop(1, "#9a9a94");
        ctx2d.fillStyle = metalGrad;
        ctx2d.fillRect(sprocketColW, 0, metalW, height);

        // 4. Cyan variable-area analog optical soundtrack (smoothly flowing ripples synced to audio)
        ctx2d.fillStyle = "#12bfd0";
        ctx2d.fillRect(cyanX, 0, cyanW, height);

        const leftTrackX = cyanX + cyanW * 0.3;
        const rightTrackX = cyanX + cyanW * 0.7;
        const maxSwing = cyanW * 0.32;
        const stepY = 2;
        const pointCount = Math.ceil(height / stepY) + 1;

        const initIdleBuffer = (phaseOffset: number): number[] => {
            const buf = new Array<number>(pointCount);
            for (let i = 0; i < pointCount; i += 1) {
                const y = i * stepY;
                const ripple =
                    0.5 +
                    0.5 *
                        Math.sin(y * 0.34 + phaseOffset) *
                        (0.65 + 0.35 * Math.cos(y * 0.11 + phaseOffset * 0.7));
                buf[i] = 0.1 + 0.32 * ripple;
            }
            return buf;
        };

        if (waveHistoryL.length !== pointCount) {
            waveHistoryL = initIdleBuffer(0);
            waveHistoryR = initIdleBuffer(1.4);
        }

        const getChannelEnergy = (bins: Uint8Array<ArrayBuffer> | null): number => {
            if (!bins || bins.length === 0) {
                return 0.25;
            }
            const limit = Math.max(1, Math.floor(bins.length * 0.45));
            let sum = 0;
            for (let i = 0; i < limit; i += 1) {
                sum += bins[i];
            }
            return Math.min(1, (sum / (limit * 255)) * 1.65);
        };

        if (isPlaying) {
            scrollAccum += 0.5;
            if (scrollAccum >= 1) {
                scrollAccum -= 1;
                phaseStep += 1;
                const eL = getChannelEnergy(freqDataL);
                const eR = getChannelEnergy(freqDataR);
                const carrierL =
                    0.5 +
                    0.5 * Math.sin(phaseStep * 0.68) * (0.65 + 0.35 * Math.cos(phaseStep * 0.22));
                const carrierR =
                    0.5 +
                    0.5 *
                        Math.sin(phaseStep * 0.68 + 1.4) *
                        (0.65 + 0.35 * Math.cos(phaseStep * 0.22 + 0.98));

                waveHistoryL.unshift(Math.min(1, 0.08 + eL * (0.35 + 0.65 * carrierL)));
                waveHistoryR.unshift(Math.min(1, 0.08 + eR * (0.35 + 0.65 * carrierR)));
                waveHistoryL.length = pointCount;
                waveHistoryR.length = pointCount;
            }
        }

        const drawTrack = (centerX: number, buf: number[]): void => {
            const halfWidths = new Array<number>(pointCount);
            for (let i = 0; i < pointCount; i += 1) {
                halfWidths[i] = (1.1 + buf[i] * maxSwing) / 2;
            }

            ctx2d.beginPath();
            for (let i = 0; i < pointCount; i += 1) {
                const y = Math.min(height, i * stepY);
                const x = centerX - halfWidths[i];
                if (i === 0) {
                    ctx2d.moveTo(x, y);
                } else {
                    ctx2d.lineTo(x, y);
                }
            }
            for (let i = pointCount - 1; i >= 0; i -= 1) {
                const y = Math.min(height, i * stepY);
                ctx2d.lineTo(centerX + halfWidths[i], y);
            }
            ctx2d.closePath();
            ctx2d.fill();
        };

        ctx2d.fillStyle = "rgba(255, 255, 255, 0.92)";
        drawTrack(leftTrackX, waveHistoryL);
        drawTrack(rightTrackX, waveHistoryR);
    };

    const tick = (): void => {
        if (!connectedAudio || connectedAudio.paused || connectedAudio.ended) {
            rafId = 0;
            renderFrame(false);
            return;
        }
        renderFrame(true);
        rafId = window.requestAnimationFrame(tick);
    };

    const ensureAudioGraph = (audio: HTMLAudioElement): void => {
        if (audioCtx) {
            if (audioCtx.state === "suspended") {
                void audioCtx.resume();
            }
            return;
        }
        const AudioCtx = window.AudioContext;
        if (!AudioCtx) {
            return;
        }
        audioCtx = new AudioCtx();
        const source = audioCtx.createMediaElementSource(audio);
        const splitter = audioCtx.createChannelSplitter(2);
        analyserL = audioCtx.createAnalyser();
        analyserR = audioCtx.createAnalyser();
        analyserL.fftSize = 256;
        analyserR.fftSize = 256;
        analyserL.smoothingTimeConstant = 0.85;
        analyserR.smoothingTimeConstant = 0.85;

        source.connect(splitter);
        splitter.connect(analyserL, 0);
        splitter.connect(analyserR, 1);
        source.connect(audioCtx.destination);

        freqDataL = new Uint8Array(analyserL.frequencyBinCount);
        freqDataR = new Uint8Array(analyserR.frequencyBinCount);
    };

    const bindAudio = (): void => {
        const audio = (window as AboutWindow).__aboutAPlayer?.audio;
        if (!audio || audio === connectedAudio) {
            return;
        }
        connectedAudio = audio;
        audio.addEventListener("play", () => {
            ensureAudioGraph(audio);
            if (!rafId) {
                rafId = window.requestAnimationFrame(tick);
            }
        });
        audio.addEventListener("pause", () => {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = 0;
            }
            renderFrame(false);
        });
        audio.addEventListener("ended", () => {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = 0;
            }
            renderFrame(false);
        });
        if (!audio.paused) {
            ensureAudioGraph(audio);
            rafId = window.requestAnimationFrame(tick);
        }
    };

    resize();
    renderFrame(false);
    bindAudio();
    window.addEventListener("about:aplayer-ready", bindAudio);
    window.addEventListener("resize", () => {
        resize();
        renderFrame(Boolean(connectedAudio && !connectedAudio.paused));
    });
}

export function init(): void {
    const select = document.getElementById("langSelect");
    const container = document.getElementById("kon-container");
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".kon-lang-btn"));
    if (!(select instanceof HTMLSelectElement) || container === null) {
        return;
    }

    const frames = [...container.querySelectorAll<HTMLElement>(".kon-film-frame")];
    if (frames.length === 0 || select.options.length === 0) {
        return;
    }

    const viewport = container.querySelector<HTMLElement>(".kon-film-viewport");

    const syncFrameHeight = (): void => {
        container.style.setProperty("--kon-frame-h", "auto");
        const ratioHeight = viewport ? Math.round((viewport.clientWidth * 9) / 16) : 0;
        let maxHeight = ratioHeight;
        for (const frame of frames) {
            maxHeight = Math.max(maxHeight, frame.scrollHeight);
        }
        if (maxHeight > 0) {
            container.style.setProperty("--kon-frame-h", `${maxHeight}px`);
        }
    };

    const defaultIndex = Number.parseInt(
        container.dataset.defaultLangIndex ?? "0",
        10
    );

    const show = (index: number): void => {
        if (!frames[index]) {
            return;
        }
        container.style.setProperty("--kon-index", String(index));
        for (const [i, frame] of frames.entries()) {
            const on = i === index;
            frame.setAttribute("aria-hidden", String(!on));
        }
        for (const [i, btn] of buttons.entries()) {
            const on = i === index;
            btn.classList.toggle("is-active", on);
            btn.setAttribute("aria-selected", String(on));
        }
        select.selectedIndex = index;
    };

    syncFrameHeight();
    initFilmTrack(container);
    window.addEventListener("resize", syncFrameHeight);

    select.addEventListener("change", () => {
        show(Number.parseInt(select.value, 10));
    });

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = Number.parseInt(btn.dataset.langIndex ?? "0", 10);
            show(idx);
        });
    });

    const preferred = frames.findIndex(frame => {
        const lang = frame.getAttribute("lang") ?? "";
        return lang !== "" && navigator.language.toLowerCase().includes(lang.toLowerCase());
    });

    // Only override SSG default when the browser prefers a different language.
    if (preferred >= 0 && preferred !== defaultIndex) {
        show(preferred);
    }
}
