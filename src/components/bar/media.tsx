import { cn } from "../../lib/utils";
import { Match, Show, Switch, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { useProviders } from "../../lib/providers-context";
import type { MediaSession } from "zebar";

function isMainMediaSession(s: MediaSession | null | undefined): boolean {
  if (!s) return false;
  const title = s.title?.trim();
  const artist = s.artist?.trim();
  if (!title && !artist) return false;

  // Filter out short video hover previews (e.g. YouTube thumbnail previews <= 10 seconds)
  if (s.endTime > 0 && s.endTime <= 10) return false;

  return true;
}

function Media() {
  const { media } = useProviders();
  const [mediaSig, setMediaSig] = createSignal(media());
  createEffect(() => setMediaSig(media()));

  // Sticky session locking
  const [lockedSessionId, setLockedSessionId] = createSignal<string | null>(null);

  const session = createMemo(() => {
    const m = mediaSig();
    if (!m) return null;

    const all = m.allSessions || [];
    const validSessions = all.filter(isMainMediaSession);

    // 1. If currently locked onto a session, keep it as long as it exists in validSessions
    const currentLockedId = lockedSessionId();
    if (currentLockedId) {
      const lockedMatch = validSessions.find((s) => s.sessionId === currentLockedId);
      if (lockedMatch) {
        // If another main session starts playing AND lockedMatch is paused, switch
        const anotherPlaying = validSessions.find(
          (s) => s.sessionId !== currentLockedId && s.isPlaying
        );
        if (!anotherPlaying || lockedMatch.isPlaying) {
          return lockedMatch;
        }
      }
    }

    // 2. Prefer currentSession if valid
    if (m.currentSession && isMainMediaSession(m.currentSession)) {
      setLockedSessionId(m.currentSession.sessionId);
      return m.currentSession;
    }

    // 3. Find any actively playing main session
    const playing = validSessions.find((s) => s.isPlaying);
    if (playing) {
      setLockedSessionId(playing.sessionId);
      return playing;
    }

    // 4. Fallback to first valid session
    const fallback = validSessions[0] || null;
    if (fallback) {
      setLockedSessionId(fallback.sessionId);
    } else {
      setLockedSessionId(null);
    }

    return fallback;
  });

  // Position interpolation for background tabs (when Chrome throttles position updates)
  const [localPos, setLocalPos] = createSignal(0);
  let lastFetchTime = Date.now();
  let basePosition = 0;

  createEffect(() => {
    const s = session();
    if (s) {
      basePosition = s.position;
      lastFetchTime = Date.now();
      setLocalPos(s.position);
    }
  });

  onMount(() => {
    const timer = setInterval(() => {
      const s = session();
      if (s && s.isPlaying) {
        const elapsed = (Date.now() - lastFetchTime) / 1000;
        const currentPos = basePosition + elapsed;
        setLocalPos(currentPos);
      }
    }, 500);

    onCleanup(() => clearInterval(timer));
  });

  const isPlaying = () => Boolean(session()?.isPlaying);

  const getTitle = () => {
    const t = session()?.title;
    if (!t) return "Unknown Title";
    return t.length > 25 ? t.slice(0, 25).trim() + "..." : t;
  };

  const getArtist = () => {
    return session()?.artist?.trim() || "";
  };

  const getProgressPercent = () => {
    const s = session();
    if (!s || !s.endTime || s.endTime <= 0) return 0;
    const pos = localPos();
    const pct = (pos / s.endTime) * 100;
    if (isNaN(pct) || !isFinite(pct)) return 0;
    return Math.min(100, Math.max(0, pct));
  };

  const togglePlayPause = () => {
    const m = mediaSig();
    const s = session();
    if (!m || !s) return;
    m.togglePlayPause({ sessionId: s.sessionId });
  };

  const playPrevious = () => {
    const m = mediaSig();
    const s = session();
    if (!m || !s) return;
    m.previous({ sessionId: s.sessionId });
  };

  const playNext = () => {
    const m = mediaSig();
    const s = session();
    if (!m || !s) return;
    m.next({ sessionId: s.sessionId });
  };

  return (
    <Show when={session()}>
      <div
        class={cn(
          "h-8 flex group items-center justify-center overflow-hidden gap-2 text-[var(--media)] bg-[var(--media)]/10 rounded-full pr-3 pl-4 relative cursor-pointer"
        )}
      >
        <Switch>
          <Match when={isPlaying()}>
            <i class="nf nf-md-music text-lg"></i>
          </Match>
          <Match when={!isPlaying()}>
            <i class="nf nf-md-music_off text-lg"></i>
          </Match>
        </Switch>

        <div class="flex items-center gap-2 group-hover:translate-y-6 group-hover:opacity-0 transition-all duration-300">
          <div class="flex items-center gap-1">
            <Show when={getArtist()}>
              <span class="text-sm">{getArtist()}</span>
              <span class="text-sm">-</span>
            </Show>
            <span class="text-sm">{getTitle()}</span>
          </div>

          <div class="w-12 h-2 bg-[var(--media)]/40 rounded-full relative overflow-hidden">
            <div
              class="h-full bg-[var(--media)] rounded-full transition-all duration-300"
              style={{
                width: `${getProgressPercent()}%`,
              }}
            ></div>
          </div>
        </div>

        <div class="transition-all -translate-y-6 duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 absolute left-12 right-0 w-auto">
          <div class="flex flex-1 w-full h-full text-lg items-center gap-1 justify-between">
            <button
              onClick={playPrevious}
              class="flex-1 min-w-0 w-full h-8 aspect-square hover:bg-current/10 rounded-full flex items-center justify-center transition-all duration-300"
              title="Previous"
            >
              <i class="ti ti-player-skip-back text-xl"></i>
            </button>
            <button
              onClick={togglePlayPause}
              class="flex-1 min-w-0 w-full h-8 aspect-square hover:bg-current/10 rounded-full flex items-center justify-center transition-all duration-300"
              title={isPlaying() ? "Pause" : "Play"}
            >
              <Show
                when={isPlaying()}
                fallback={<i class="ti ti-player-play text-xl"></i>}
              >
                <i class="ti ti-player-pause text-xl"></i>
              </Show>
            </button>
            <button
              onClick={playNext}
              class="flex-1 min-w-0 w-full h-8 aspect-square hover:bg-current/10 rounded-full flex items-center justify-center transition-all duration-300"
              title="Next"
            >
              <i class="ti ti-player-skip-forward text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}

export default Media;
