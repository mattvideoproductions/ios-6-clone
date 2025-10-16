import { useEffect, useMemo, useState } from 'react';
import {
  achievements as achievementsSeed,
  friendRequests as friendRequestsSeed,
  friends as friendsSeed,
  games as gamesSeed,
  leaderboardEntries as leaderboardSeed,
  type Friend,
  type FriendRequest,
  type LeaderboardEntry
} from './data/gameCenterData';
import { cn } from './utils/cn';
import {
  formatPlayersOnline,
  formatScore,
  getAchievementProgress,
  getRarityLabel,
  sortLeaderboardEntries,
  type LeaderboardSortKey
} from './utils/gameCenterUtils';

const tabs = ['Games', 'Friends', 'Leaderboards', 'Achievements'] as const;
type Tab = (typeof tabs)[number];

const requestToFriend = (request: FriendRequest): Friend => ({
  id: `friend-${request.id}`,
  name: request.from,
  status: 'online',
  avatar: request.avatar,
  favorite: false,
  currentlyPlaying: 'Ready to play'
});

const TabLabel: Record<Tab, string> = {
  Games: 'Games',
  Friends: 'Friends',
  Leaderboards: 'Leaderboards',
  Achievements: 'Achievements'
};

const App = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<Tab>('Games');
  const [friends, setFriends] = useState<Friend[]>(friendsSeed);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>(friendRequestsSeed);
  const [sortKey, setSortKey] = useState<LeaderboardSortKey>('score');
  const [isSorting, setIsSorting] = useState(false);
  const [modalRequest, setModalRequest] = useState<FriendRequest | null>(null);

  useEffect(() => {
    if (!isSorting) return;
    const timeout = window.setTimeout(() => setIsSorting(false), 320);
    return () => window.clearTimeout(timeout);
  }, [isSorting]);

  const sortedEntries = useMemo<LeaderboardEntry[]>(
    () => sortLeaderboardEntries(leaderboardSeed, sortKey),
    [sortKey]
  );

  const handleTabClick = (tab: Tab): void => {
    setActiveTab(tab);
  };

  const openRequestModal = (request: FriendRequest): void => {
    setModalRequest(request);
  };

  const closeModal = (): void => {
    setModalRequest(null);
  };

  const handleRequestAction = (requestId: string, accepted: boolean): void => {
    const request = pendingRequests.find((entry) => entry.id === requestId);

    setPendingRequests((current) => current.filter((entry) => entry.id !== requestId));

    if (accepted && request) {
      setFriends((current) => [...current, requestToFriend(request)]);
    }

    setModalRequest(null);
  };

  const onSortChange = (key: LeaderboardSortKey): void => {
    if (key === sortKey) {
      return;
    }

    setIsSorting(true);
    setSortKey(key);
  };

  const renderGamesTab = (): JSX.Element => (
    <div className="games-grid">
      {gamesSeed.map((game) => (
        <article key={game.id} className="card game-card" aria-label={`${game.title} game summary`}>
          <div className="game-card__icon" aria-hidden>{game.icon}</div>
          <div className="game-card__body">
            <header className="game-card__header">
              <h3 className="game-card__title">{game.title}</h3>
              <span className="game-card__subtitle">{game.subtitle}</span>
            </header>
            <dl className="game-card__meta">
              <div>
                <dt>Presence</dt>
                <dd>{formatPlayersOnline(game.playersOnline)}</dd>
              </div>
              <div>
                <dt>Progress</dt>
                <dd>
                  {game.achievementsUnlocked}/{game.totalAchievements} achievements
                </dd>
              </div>
              <div>
                <dt>Last played</dt>
                <dd>{game.lastPlayed}</dd>
              </div>
            </dl>
          </div>
        </article>
      ))}
    </div>
  );

  const renderFriendsTab = (): JSX.Element => (
    <div className="friends-layout">
      <section className="card friend-requests" aria-label="Pending friend requests">
        <header className="section-heading">
          <h3>Friend Requests</h3>
          <span className="section-heading__badge">{pendingRequests.length}</span>
        </header>
        {pendingRequests.length === 0 ? (
          <p className="empty-state">You're all caught up! No pending requests.</p>
        ) : (
          <ul className="request-list">
            {pendingRequests.map((request) => (
              <li key={request.id} className="request-card">
                <div className="request-card__avatar" aria-hidden>
                  {request.avatar}
                </div>
                <div className="request-card__body">
                  <h4>{request.from}</h4>
                  <p>
                    {request.mutualFriends} mutual friends • {request.mutualGames} mutual games
                  </p>
                </div>
                <div className="request-card__actions">
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => handleRequestAction(request.id, false)}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    className="button button--highlight"
                    onClick={() => handleRequestAction(request.id, true)}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="button button--info"
                    onClick={() => openRequestModal(request)}
                  >
                    View details
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card friend-roster" aria-label="Friends list">
        <header className="section-heading">
          <h3>Friends</h3>
          <span className="section-heading__badge">{friends.length}</span>
        </header>
        <ul className="friend-list">
          {friends.map((friend) => (
            <li key={friend.id} className={cn('friend-row', friend.favorite && 'friend-row--favorite')}>
              <div className="friend-avatar" aria-hidden>
                <span>{friend.avatar}</span>
              </div>
              <div className="friend-meta">
                <div className="friend-meta__top">
                  <span className="friend-name">{friend.name}</span>
                  <span className={cn('presence-indicator', `presence-indicator--${friend.status}`)}>
                    {friend.status === 'online' && 'Online'}
                    {friend.status === 'away' && 'Away'}
                    {friend.status === 'offline' && 'Offline'}
                  </span>
                </div>
                <span className="friend-activity">
                  {friend.currentlyPlaying ?? friend.lastPlayed ?? 'Exploring new games'}
                </span>
              </div>
              {friend.favorite && <span className="friend-favorite" aria-label="Favorite friend">★</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );

  const renderLeaderboardTab = (): JSX.Element => (
    <section
      className={cn('card leaderboard-card', isSorting && 'leaderboard-card--sorting')}
      aria-label="Leaderboard"
    >
      <header className="section-heading leaderboard-heading">
        <div>
          <h3>Global Rankings</h3>
          <p>Compare scores and climb the season ladder.</p>
        </div>
        <div className="segmented-control" role="group" aria-label="Sort leaderboard">
          <button
            type="button"
            className={cn('segmented-control__button', sortKey === 'score' && 'is-active')}
            aria-pressed={sortKey === 'score'}
            onClick={() => onSortChange('score')}
          >
            Score
          </button>
          <button
            type="button"
            className={cn('segmented-control__button', sortKey === 'streak' && 'is-active')}
            aria-pressed={sortKey === 'streak'}
            onClick={() => onSortChange('streak')}
          >
            Streak
          </button>
          <button
            type="button"
            className={cn('segmented-control__button', sortKey === 'name' && 'is-active')}
            aria-pressed={sortKey === 'name'}
            onClick={() => onSortChange('name')}
          >
            Name
          </button>
        </div>
      </header>
      <ul className="leaderboard-list">
        {sortedEntries.map((entry, index) => (
          <li key={entry.id} className="leaderboard-row">
            <span className="leaderboard-rank">#{index + 1}</span>
            <div className="leaderboard-avatar" aria-hidden>
              {entry.avatar}
            </div>
            <div className="leaderboard-meta">
              <span className="leaderboard-name">{entry.player}</span>
              <span className="leaderboard-sub">{entry.country}</span>
            </div>
            <div className="leaderboard-score">
              <span>{formatScore(entry.score)}</span>
              <span className="leaderboard-streak">Best streak: {entry.bestStreak}</span>
            </div>
            <span className={cn('leaderboard-trend', `leaderboard-trend--${entry.trend}`)} aria-label={`Trend ${entry.trend}`}>
              {entry.trend === 'up' && '▲'}
              {entry.trend === 'down' && '▼'}
              {entry.trend === 'steady' && '▪'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );

  const renderAchievementsTab = (): JSX.Element => (
    <section className="card achievements-card" aria-label="Achievements">
      <header className="section-heading">
        <h3>Achievements</h3>
        <p>Track your milestones across every game.</p>
      </header>
      <ul className="achievement-list">
        {achievementsSeed.map((achievement) => {
          const progressValue = getAchievementProgress(achievement);
          return (
            <li key={achievement.id} className="achievement-row">
              <div className="achievement-icon" aria-hidden>
                <span>{achievement.icon}</span>
              </div>
              <div className="achievement-meta">
                <div className="achievement-meta__header">
                  <h4>{achievement.title}</h4>
                  <span className={cn('achievement-rarity', `achievement-rarity--${achievement.rarity}`)}>
                    {getRarityLabel(achievement.rarity)}
                  </span>
                </div>
                <span className="achievement-game">{achievement.gameTitle}</span>
                <p className="achievement-description">{achievement.description}</p>
                <div
                  className="achievement-progress"
                  role="progressbar"
                  aria-label={`Progress for ${achievement.title}`}
                  aria-valuemin={0}
                  aria-valuemax={achievement.target}
                  aria-valuenow={achievement.progress}
                  aria-valuetext={`${progressValue}% complete`}
                >
                  <div className="achievement-progress__bar" style={{ width: `${progressValue}%` }} />
                </div>
                <span className="achievement-progress__label">
                  {achievement.progress}/{achievement.target}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );

  return (
    <div className="app-shell">
      <div className="game-center-frame" role="application" aria-label="Game Center interface">
        <header className="top-bar">
          <div className="top-bar__title">
            <span className="top-bar__badge">GC</span>
            <h1>Game Center</h1>
          </div>
          <div className="top-bar__status">
            <span className="status-pill">Connected</span>
            <span className="status-pill status-pill--glow">Season VII</span>
          </div>
        </header>
        <nav className="tab-bar" role="tablist" aria-label="Game Center tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={cn('tab-bar__button', activeTab === tab && 'tab-bar__button--active')}
              onClick={() => handleTabClick(tab)}
            >
              {TabLabel[tab]}
            </button>
          ))}
        </nav>
        <main className="panel" aria-live="polite">
          <div key={activeTab} className="panel__content">
            {activeTab === 'Games' && renderGamesTab()}
            {activeTab === 'Friends' && renderFriendsTab()}
            {activeTab === 'Leaderboards' && renderLeaderboardTab()}
            {activeTab === 'Achievements' && renderAchievementsTab()}
          </div>
        </main>
      </div>

      {modalRequest && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="request-modal-title">
          <div className="modal__backdrop" onClick={closeModal} />
          <div className="modal__dialog">
            <header className="modal__header">
              <div className="modal__avatar" aria-hidden>
                {modalRequest.avatar}
              </div>
              <div>
                <h2 id="request-modal-title">{modalRequest.from}</h2>
                <p>
                  {modalRequest.mutualFriends} mutual friends • {modalRequest.mutualGames} mutual games
                </p>
              </div>
            </header>
            <p className="modal__message">{modalRequest.message}</p>
            <footer className="modal__actions">
              <button type="button" className="button button--ghost" onClick={closeModal}>
                Close
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => handleRequestAction(modalRequest.id, false)}
              >
                Decline
              </button>
              <button
                type="button"
                className="button button--highlight"
                onClick={() => handleRequestAction(modalRequest.id, true)}
              >
                Accept
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
