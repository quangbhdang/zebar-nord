import { cn } from "../../lib/utils";
import { Match, Show, Switch, createEffect, createMemo, createSignal } from "solid-js";
import { useProviders } from "../../lib/providers-context";
import type { MediaSession } from "zebar";

function isValidSession(s: MediaSession | null | undefined): boolean {
  if (!s) return false;
  const title = s.title?.trim();
  const artist = s.artist?.trim();
  // A session must have at least a non-empty title or artist
  return Boolean(title || artist);
}

function Media() {
  const { media } = useProviders();
  const [mediaSig, setMediaSig] = createSignal(media());
  createEffect(() => setMediaSig(media()));

  // Sticky session locking to prevent rapid flickering when hovering over YouTube thumbnails/players
  const [lockedSessionId, setLockedSessionId] = createSignal<string | null>(null);

  const session = createMemo(() => {
    const m = mediaSig();
    if (!m) return null;

    const all = m.allSessions || [];
    const validSessions = all.filter(isValidSession);

    // 1. If currently locked onto a valid session, stick with it unless it stopped and another is playing
    const currentLockedId = lockedSessionId();
    if (currentLockedId) {
      const lockedMatch = validSessions.find((s) => s.sessionId === currentLockedId);
      if (lockedMatch) {
        const anotherPlaying = validSessions.find(
          (s) => s.sessionId !== currentLockedId && s.isPlaying
        );
        // Only switch away from lockedMatch if it is paused AND another session is playing
        if (!anotherPlaying || lockedMatch.isPlaying) {
          return lockedMatch;
        }
      }
    }

    // 2. Otherwise pick current playing session
    if (m.currentSession && isValidSession(m.currentSession) && m.currentSession.isPlaying) {
      setLockedSessionId(m.currentSession.sessionId);
      return m.currentSession;
    }

    const playing = validSessions.find((s) => s.isPlaying);
    if (playing) {
      setLockedSessionId(playing.sessionId);
      return playing;
    }

    // 3. Fallback to currentSession or first valid session
    const fallback =
      (m.currentSession && isValidSession(m.currentSession) ? m.currentSession : null) ||
      validSessions[0] ||
      null;

    if (fallback) {
      setLockedSessionId(fallback.sessionId);
    } else {
      setLockedSessionId(null);
    }

    return fallback;
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
    const pct = (s.position / s.endTime) * 100;
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
