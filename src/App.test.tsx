import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('Game Center interface', () => {
  it('renders the Game Center frame with the Games tab active', () => {
    const { container } = render(<App />);

    const gamesTab = screen.getByRole('tab', { name: /games/i });
    expect(gamesTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Neon Knights')).toBeInTheDocument();

    expect(container.firstChild).toMatchSnapshot();
  });

  it('moves a friend request into the roster when accepted', async () => {
    const user = userEvent.setup();
    render(<App />);

    const friendRoster = screen.getByLabelText(/friends list/i);
    const friendList = within(friendRoster).getByRole('list');
    const initialFriendItems = within(friendList).getAllByRole('listitem');

    const requestsSection = screen.getByLabelText(/pending friend requests/i);
    const requestItemsBefore = within(requestsSection).getAllByRole('listitem');

    await user.click(screen.getAllByRole('button', { name: /accept/i })[0]);

    const updatedFriendItems = within(friendList).getAllByRole('listitem');
    expect(updatedFriendItems).toHaveLength(initialFriendItems.length + 1);
    expect(within(friendList).getByText('Lina Kovács')).toBeInTheDocument();

    const requestItemsAfter = within(requestsSection).queryAllByRole('listitem');
    expect(requestItemsAfter).toHaveLength(requestItemsBefore.length - 1);
  });

  it('sorts the leaderboard entries when a sort mode is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /leaderboards/i }));

    const leaderboardSection = screen.getByLabelText(/leaderboard/i);
    const leaderboardList = within(leaderboardSection).getByRole('list');

    let rows = within(leaderboardList).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('Amelia Chen');

    await user.click(screen.getByRole('button', { name: /streak/i }));

    rows = within(leaderboardList).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('Diego Martínez');

    await user.click(screen.getByRole('button', { name: /name/i }));

    rows = within(leaderboardList).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('Amelia Chen');
  });

  it('exposes achievement progress with semantic progress bars', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /achievements/i }));

    const emeraldProgress = screen.getByRole('progressbar', {
      name: /progress for emerald vanguard/i
    });

    expect(emeraldProgress).toHaveAttribute('aria-valuenow', '3');
    expect(emeraldProgress).toHaveAttribute('aria-valuemax', '5');
    expect(emeraldProgress).toHaveAttribute('aria-valuetext', '60% complete');

    const bar = emeraldProgress.querySelector('.achievement-progress__bar');
    expect(bar?.getAttribute('style')).toContain('width: 60%');
  });
});
