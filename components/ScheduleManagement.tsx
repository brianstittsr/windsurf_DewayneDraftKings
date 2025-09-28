'use client';

import { useState, useEffect } from 'react';
import { Schedule, Team, League } from '../lib/firestore-schema';

interface ScheduleFormData {
  homeTeamId: string;
  awayTeamId: string;
  leagueId: string;
  gameDate: string;
  gameTime: string;
  duration: number;
  venue: string;
  field: string;
  address: string;
  week?: number;
  round?: number;
  gameType: 'regular' | 'playoff' | 'championship' | 'friendly';
  referees: string[];
  weather: string;
  temperature?: number;
  fieldConditions: string;
  notes: string;
}

const initialFormData: ScheduleFormData = {
  homeTeamId: '',
  awayTeamId: '',
  leagueId: '',
  gameDate: '',
  gameTime: '18:00',
  duration: 60,
  venue: 'All Pro Sports Complex',
  field: '',
  address: '',
  week: 1,
  round: 1,
  gameType: 'regular',
  referees: [],
  weather: '',
  temperature: undefined,
  fieldConditions: 'Good',
  notes: ''
};

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'delete'>('create');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [weekFilter, setWeekFilter] = useState('all');

  useEffect(() => {
    fetchSchedules();
    fetchTeams();
    fetchLeagues();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schedules');
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
      } else {
        console.error('Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/leagues');
      if (response.ok) {
        const data = await response.json();
        setLeagues(data.leagues || []);
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = modalMode === 'create' ? '/api/schedules' : `/api/schedules/${selectedSchedule?.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchSchedules();
        setShowModal(false);
        setFormData(initialFormData);
        setSelectedSchedule(null);
        alert(`Game ${modalMode === 'create' ? 'scheduled' : 'updated'} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Error saving schedule');
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      homeTeamId: schedule.homeTeamId,
      awayTeamId: schedule.awayTeamId,
      leagueId: schedule.leagueId,
      gameDate: new Date(schedule.gameDate.toDate()).toISOString().split('T')[0],
      gameTime: schedule.gameTime,
      duration: schedule.duration,
      venue: schedule.venue,
      field: schedule.field || '',
      address: schedule.address || '',
      week: schedule.week,
      round: schedule.round,
      gameType: schedule.gameType,
      referees: schedule.referees || [],
      weather: schedule.weather || '',
      temperature: schedule.temperature,
      fieldConditions: schedule.fieldConditions || 'Good',
      notes: schedule.notes || ''
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (schedule: Schedule) => {
    if (!confirm(`Are you sure you want to delete this game?`)) return;

    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchSchedules();
        alert('Game deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Error deleting schedule');
    }
  };

  const handleCreate = () => {
    setSelectedSchedule(null);
    setFormData(initialFormData);
    setModalMode('create');
    setShowModal(true);
  };

  const updateGameStatus = async (schedule: Schedule, newStatus: string) => {
    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...schedule, status: newStatus })
      });

      if (response.ok) {
        await fetchSchedules();
        alert(`Game status updated to ${newStatus}!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating game status:', error);
      alert('Error updating game status');
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getLeagueName = (leagueId: string) => {
    const league = leagues.find(l => l.id === leagueId);
    return league ? league.name : 'Unknown League';
  };

  const filteredSchedules = schedules.filter(schedule => {
    const homeTeamName = getTeamName(schedule.homeTeamId);
    const awayTeamName = getTeamName(schedule.awayTeamId);
    const matchesSearch = homeTeamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         awayTeamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLeague = leagueFilter === 'all' || schedule.leagueId === leagueFilter;
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    const matchesWeek = weekFilter === 'all' || schedule.week?.toString() === weekFilter;
    return matchesSearch && matchesLeague && matchesStatus && matchesWeek;
  });

  return (
    <div className="schedule-management">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Schedule Management</h3>
          <p className="text-muted mb-0">Create and manage game schedules</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleCreate}
        >
          <i className="fas fa-plus me-2"></i>
          Schedule Game
        </button>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value)}
          >
            <option value="all">All Leagues</option>
            {leagues.map(league => (
              <option key={league.id} value={league.id}>{league.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="postponed">Postponed</option>
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={weekFilter}
            onChange={(e) => setWeekFilter(e.target.value)}
          >
            <option value="all">All Weeks</option>
            {Array.from({length: 16}, (_, i) => i + 1).map(week => (
              <option key={week} value={week.toString()}>Week {week}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-calendar fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No games scheduled</h5>
              <p className="text-muted">Schedule your first game to get started.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>Matchup</th>
                    <th>League</th>
                    <th>Venue</th>
                    <th>Week</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td>
                        <div>
                          <div className="fw-bold">
                            {new Date(schedule.gameDate.toDate()).toLocaleDateString()}
                          </div>
                          <small className="text-muted">{schedule.gameTime}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div>{getTeamName(schedule.homeTeamId)} vs</div>
                          <div>{getTeamName(schedule.awayTeamId)}</div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {getLeagueName(schedule.leagueId)}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{schedule.venue}</div>
                          {schedule.field && (
                            <small className="text-muted">{schedule.field}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        {schedule.week && (
                          <span className="badge bg-secondary">Week {schedule.week}</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          schedule.gameType === 'championship' ? 'bg-warning' :
                          schedule.gameType === 'playoff' ? 'bg-info' : 'bg-primary'
                        }`}>
                          {schedule.gameType.charAt(0).toUpperCase() + schedule.gameType.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="dropdown">
                          <button
                            className={`btn btn-sm dropdown-toggle ${
                              schedule.status === 'completed' ? 'btn-success' :
                              schedule.status === 'in-progress' ? 'btn-warning' :
                              schedule.status === 'cancelled' ? 'btn-danger' :
                              schedule.status === 'postponed' ? 'btn-secondary' : 'btn-primary'
                            }`}
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                          </button>
                          <ul className="dropdown-menu">
                            <li><button className="dropdown-item" onClick={() => updateGameStatus(schedule, 'scheduled')}>Scheduled</button></li>
                            <li><button className="dropdown-item" onClick={() => updateGameStatus(schedule, 'in-progress')}>In Progress</button></li>
                            <li><button className="dropdown-item" onClick={() => updateGameStatus(schedule, 'completed')}>Completed</button></li>
                            <li><button className="dropdown-item" onClick={() => updateGameStatus(schedule, 'cancelled')}>Cancelled</button></li>
                            <li><button className="dropdown-item" onClick={() => updateGameStatus(schedule, 'postponed')}>Postponed</button></li>
                          </ul>
                        </div>
                      </td>
                      <td>
                        {schedule.homeScore !== undefined && schedule.awayScore !== undefined ? (
                          <span className="fw-bold">
                            {schedule.homeScore} - {schedule.awayScore}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleView(schedule)}
                            title="View"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEdit(schedule)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(schedule)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === 'create' && <><i className="fas fa-plus me-2"></i>Schedule Game</>}
                  {modalMode === 'edit' && <><i className="fas fa-edit me-2"></i>Edit Game</>}
                  {modalMode === 'view' && <><i className="fas fa-eye me-2"></i>View Game</>}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {modalMode === 'view' && selectedSchedule ? (
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-primary mb-3">Game Information</h6>
                      <p><strong>Home Team:</strong> {getTeamName(selectedSchedule.homeTeamId)}</p>
                      <p><strong>Away Team:</strong> {getTeamName(selectedSchedule.awayTeamId)}</p>
                      <p><strong>League:</strong> {getLeagueName(selectedSchedule.leagueId)}</p>
                      <p><strong>Date:</strong> {new Date(selectedSchedule.gameDate.toDate()).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {selectedSchedule.gameTime}</p>
                      <p><strong>Duration:</strong> {selectedSchedule.duration} minutes</p>
                      <p><strong>Type:</strong> {selectedSchedule.gameType}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-success mb-3">Venue & Details</h6>
                      <p><strong>Venue:</strong> {selectedSchedule.venue}</p>
                      {selectedSchedule.field && <p><strong>Field:</strong> {selectedSchedule.field}</p>}
                      {selectedSchedule.address && <p><strong>Address:</strong> {selectedSchedule.address}</p>}
                      {selectedSchedule.week && <p><strong>Week:</strong> {selectedSchedule.week}</p>}
                      {selectedSchedule.round && <p><strong>Round:</strong> {selectedSchedule.round}</p>}
                      <p><strong>Status:</strong> 
                        <span className={`badge ms-2 ${
                          selectedSchedule.status === 'completed' ? 'bg-success' :
                          selectedSchedule.status === 'in-progress' ? 'bg-warning' :
                          selectedSchedule.status === 'cancelled' ? 'bg-danger' : 'bg-primary'
                        }`}>
                          {selectedSchedule.status}
                        </span>
                      </p>
                      {selectedSchedule.notes && <p><strong>Notes:</strong> {selectedSchedule.notes}</p>}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      {/* Game Setup */}
                      <div className="col-12">
                        <h6 className="text-primary mb-3">Game Setup</h6>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">League *</label>
                          <select
                            className="form-select"
                            value={formData.leagueId}
                            onChange={(e) => setFormData(prev => ({ ...prev, leagueId: e.target.value }))}
                            required
                          >
                            <option value="">Select League</option>
                            {leagues.map(league => (
                              <option key={league.id} value={league.id}>{league.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Home Team *</label>
                          <select
                            className="form-select"
                            value={formData.homeTeamId}
                            onChange={(e) => setFormData(prev => ({ ...prev, homeTeamId: e.target.value }))}
                            required
                          >
                            <option value="">Select Home Team</option>
                            {teams.map(team => (
                              <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Away Team *</label>
                          <select
                            className="form-select"
                            value={formData.awayTeamId}
                            onChange={(e) => setFormData(prev => ({ ...prev, awayTeamId: e.target.value }))}
                            required
                          >
                            <option value="">Select Away Team</option>
                            {teams.filter(team => team.id !== formData.homeTeamId).map(team => (
                              <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Game Date *</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.gameDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, gameDate: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Game Time *</label>
                          <input
                            type="time"
                            className="form-control"
                            value={formData.gameTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, gameTime: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Duration (minutes)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.duration}
                            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                            min="30"
                            max="180"
                          />
                        </div>
                      </div>

                      {/* Venue Information */}
                      <div className="col-12">
                        <h6 className="text-info mb-3 mt-4">Venue Information</h6>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Venue *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.venue}
                            onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Field</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.field}
                            onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value }))}
                            placeholder="e.g., Field A"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Address</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Venue address..."
                          />
                        </div>
                      </div>

                      {/* Game Details */}
                      <div className="col-12">
                        <h6 className="text-warning mb-3 mt-4">Game Details</h6>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Week</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.week || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, week: e.target.value ? parseInt(e.target.value) : undefined }))}
                            min="1"
                            max="20"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Round</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.round || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, round: e.target.value ? parseInt(e.target.value) : undefined }))}
                            min="1"
                            max="10"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Game Type</label>
                          <select
                            className="form-select"
                            value={formData.gameType}
                            onChange={(e) => setFormData(prev => ({ ...prev, gameType: e.target.value as any }))}
                          >
                            <option value="regular">Regular</option>
                            <option value="playoff">Playoff</option>
                            <option value="championship">Championship</option>
                            <option value="friendly">Friendly</option>
                          </select>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="col-12">
                        <h6 className="text-success mb-3 mt-4">Additional Information</h6>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Notes</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Game notes, special instructions, etc..."
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    {modalMode === 'create' ? 'Schedule Game' : 'Update Game'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
