import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workoutsAPI, usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Play,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All',
  'strength',
  'cardio',
  'hiit',
  'powerlifting',
  'bodybuilding',
  'calisthenics',
  'yoga',
];

const DIFFICULTIES = [
  'All',
  'beginner',
  'intermediate',
  'advanced',
];

function WorkoutCard({ workout }) {
  const navigate = useNavigate();

  const colors = {
    strength: 'var(--blue)',
    cardio: 'var(--red)',
    hiit: 'var(--orange)',
    powerlifting: 'var(--purple)',
    bodybuilding: 'var(--accent)',
  };

  const color = colors[workout.category] || 'var(--text-2)';

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: 18,
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 12,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color,
              background: `${color}18`,
              padding: '4px 9px',
              borderRadius: 999,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {workout.category}
          </span>

          <span
            style={{
              fontSize: 11,
              color: 'var(--text-3)',
              background: 'var(--bg-3)',
              padding: '4px 9px',
              borderRadius: 999,
              textTransform: 'capitalize',
            }}
          >
            {workout.difficulty}
          </span>
        </div>

        <h3
          style={{
            fontSize: 17,
            fontWeight: 700,
            marginBottom: 7,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {workout.name}
        </h3>

        {workout.description && (
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-2)',
              marginBottom: 12,
              lineHeight: 1.55,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {workout.description}
          </p>
        )}

        <div
          style={{
            fontSize: 12,
            color: 'var(--text-3)',
            marginBottom: 12,
          }}
        >
          {workout.exercises?.length || 0} exercises ·{' '}
          {workout.timesUsed || 0} uses
          {workout.rating > 0 &&
            ` · ${workout.rating.toFixed(1)} rating`}
        </div>

        {workout.creator && (
          <Link
            to={`/profile/${workout.creator.username}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              color: 'var(--text-3)',
              fontSize: 12,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="avatar"
              style={{
                width: 22,
                height: 22,
                fontSize: 10,
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
              }}
            >
              {workout.creator.avatar ? (
                <img
                  src={workout.creator.avatar}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                  }}
                />
              ) : (
                workout.creator.displayName?.[0]?.toUpperCase()
              )}
            </div>

            {workout.creator.displayName}
          </Link>
        )}
      </div>

      <div
        style={{
          padding: '11px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 8,
        }}
      >
        <button
          className="btn btn-primary btn-sm"
          style={{
            flex: 1,
          }}
          onClick={() =>
            navigate('/session/active', {
              state: { workout },
            })
          }
        >
          <Play size={15} />
          Start
        </button>

        <Link
          to={`/workouts/${workout._id}`}
          className="btn btn-secondary btn-sm"
        >
          Details
        </Link>
      </div>
    </div>
  );
}

function UserCard({ user: profileUser, currentUser }) {
  const [following, setFollowing] = useState(
    currentUser?.following?.some(
      (f) => f === profileUser._id || f?._id === profileUser._id
    )
  );

  const [loading, setLoading] = useState(false);

  const handleFollow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);

    try {
      await usersAPI.follow(profileUser._id);

      setFollowing((value) => !value);

      toast.success(
        following
          ? `Unfollowed ${profileUser.displayName}`
          : `Following ${profileUser.displayName}!`
      );
    } catch {
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      to={`/profile/${profileUser.username}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '15px 17px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        textDecoration: 'none',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-active)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div
        className="avatar avatar-md"
        style={{
          background: 'var(--accent-dim)',
          color: 'var(--accent)',
          fontSize: 18,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {profileUser.avatar ? (
          <img
            src={profileUser.avatar}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          profileUser.displayName?.[0]?.toUpperCase()
        )}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {profileUser.displayName}
        </div>

        <div
          style={{
            fontSize: 12,
            color: 'var(--text-3)',
            marginTop: 2,
          }}
        >
          @{profileUser.username} · {profileUser.fitnessLevel}
        </div>

        <div
          style={{
            fontSize: 12,
            color: 'var(--text-3)',
            marginTop: 3,
          }}
        >
          {profileUser.followers?.length || 0} followers ·{' '}
          {profileUser.stats?.totalWorkouts || 0} workouts
        </div>
      </div>

      {currentUser && currentUser._id !== profileUser._id && (
        <button
          type="button"
          onClick={handleFollow}
          disabled={loading}
          className={`btn btn-sm ${
            following ? 'btn-secondary' : 'btn-primary'
          }`}
          style={{
            flexShrink: 0,
            minWidth: 92,
          }}
        >
          {loading ? (
            <span className="spinner" />
          ) : following ? (
            <>
              <UserCheck size={14} />
              Following
            </>
          ) : (
            <>
              <UserPlus size={14} />
              Follow
            </>
          )}
        </button>
      )}
    </Link>
  );
}

export default function ExplorePage() {
  const { user } = useAuth();

  const [tab, setTab] = useState('workouts');
  const [workouts, setWorkouts] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [sort, setSort] = useState('popular');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        if (tab === 'workouts') {
          const params = {
            sort,
            limit: 24,
          };

          if (category !== 'All') {
            params.category = category;
          }

          if (difficulty !== 'All') {
            params.difficulty = difficulty;
          }

          if (searchQuery) {
            params.search = searchQuery;
          }

          const res = await workoutsAPI.explore(params);

          if (!cancelled) {
            setWorkouts(res.data.workouts || []);
          }
        } else {
          const res = await usersAPI.search(searchQuery);

          if (!cancelled) {
            setUsers(Array.isArray(res.data) ? res.data : []);
          }
        }
      } catch (error) {
        if (!cancelled) {
          if (error.response?.status !== 429) {
            toast.error(
              tab === 'workouts'
                ? 'Failed to load workouts'
                : 'Failed to load athletes'
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [tab, category, difficulty, sort, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(search.trim());
  };

  return (
    <div className="page-container animate-fade">
      <div
        style={{
          marginBottom: 28,
        }}
      >
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 7,
          }}
        >
          Explore
        </h1>

        <p
          style={{
            color: 'var(--text-3)',
            fontSize: 14,
          }}
        >
          Discover workouts and athletes to keep your training moving.
        </p>
      </div>

      <div
        className="tab-bar"
        style={{
          width: 'fit-content',
          marginBottom: 22,
        }}
      >
        <button
          className={`tab-btn ${
            tab === 'workouts' ? 'active' : ''
          }`}
          onClick={() => setTab('workouts')}
        >
          Workouts
        </button>

        <button
          className={`tab-btn ${
            tab === 'athletes' ? 'active' : ''
          }`}
          onClick={() => setTab('athletes')}
        >
          Athletes
        </button>
      </div>

      <form
        onSubmit={handleSearch}
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            position: 'relative',
            flex: 1,
            minWidth: 220,
          }}
        >
          <Search
            size={17}
            style={{
              position: 'absolute',
              left: 13,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-3)',
              pointerEvents: 'none',
            }}
          />

          <input
            className="form-input"
            style={{
              paddingLeft: 39,
              width: '100%',
            }}
            placeholder={
              tab === 'workouts'
                ? 'Search workouts...'
                : 'Search athletes...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {tab === 'workouts' && (
          <>
            <select
              className="form-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>

            <select
              className="form-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {DIFFICULTIES.map((level) => (
                <option key={level} value={level}>
                  {level === 'All' ? 'All Levels' : level}
                </option>
              ))}
            </select>
          </>
        )}

        <button
          type="submit"
          className="btn btn-primary"
        >
          <Search size={16} />
          Search
        </button>
      </form>

      {tab === 'workouts' && (
        <div
          style={{
            display: 'flex',
            gap: 7,
            marginBottom: 24,
            overflowX: 'auto',
            paddingBottom: 4,
          }}
        >
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              style={{
                padding: '7px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                flexShrink: 0,
                background:
                  category === item
                    ? 'var(--accent)'
                    : 'var(--bg-2)',
                color:
                  category === item
                    ? 'var(--bg-0)'
                    : 'var(--text-2)',
                border: `1px solid ${
                  category === item
                    ? 'var(--accent)'
                    : 'var(--border)'
                }`,
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="skeleton"
              style={{
                height: 205,
                borderRadius: 12,
              }}
            />
          ))}
        </div>
      ) : tab === 'workouts' ? (
        workouts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '70px 20px',
              color: 'var(--text-3)',
            }}
          >
            <Search
              size={32}
              style={{
                marginBottom: 14,
                opacity: 0.5,
              }}
            />

            <p>No workouts found.</p>

            <span
              style={{
                fontSize: 13,
              }}
            >
              Try adjusting your search or filters.
            </span>
          </div>
        ) : (
          <div className="grid-3">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout._id}
                workout={workout}
              />
            ))}
          </div>
        )
      ) : users.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '70px 20px',
            color: 'var(--text-3)',
          }}
        >
          <UserPlus
            size={32}
            style={{
              marginBottom: 14,
              opacity: 0.5,
            }}
          />

          <p>No athletes found.</p>

          <span
            style={{
              fontSize: 13,
            }}
          >
            Try searching for another athlete.
          </span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            maxWidth: 760,
          }}
        >
          {users.map((profileUser) => (
            <UserCard
              key={profileUser._id}
              user={profileUser}
              currentUser={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}