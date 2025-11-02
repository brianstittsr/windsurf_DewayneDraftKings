import React from 'react';

const CoachDashboard = () => {
  // Mock data - will be replaced with API data
  const teamInfo = {
    name: 'Vipers',
    record: '5-3',
    playerCount: 12,
    nextGame: 'Saturday, Nov 8th @ 2:00 PM vs. Raiders',
  };

  const roster = [
    { id: 1, name: 'Marcus Johnson', position: 'QB', status: 'Active' },
    { id: 2, name: 'David Smith', position: 'WR', status: 'Active' },
    { id: 3, name: 'James Brown', position: 'RB', status: 'Injured' },
    { id: 4, name: 'Robert Davis', position: 'CB', status: 'Active' },
  ];

  const upcomingSchedule = [
    { opponent: 'Raiders', date: 'Nov 8, 2025', location: 'Field 2' },
    { opponent: 'Titans', date: 'Nov 15, 2025', location: 'Field 1' },
  ];

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Coach Dashboard</h1>

      <div className="row">
        <div className="col-lg-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">My Team: {teamInfo.name} ({teamInfo.record})</h6>
            </div>
            <div className="card-body">
                <p><strong>Next Game:</strong> {teamInfo.nextGame}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Team Roster */}
        <div className="col-xl-8 col-lg-7">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Team Roster ({teamInfo.playerCount} Players)</h6>
              <button className="btn btn-primary btn-sm">Manage Roster</button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map(player => (
                      <tr key={player.id}>
                        <td>{player.name}</td>
                        <td>{player.position}</td>
                        <td>
                          <span className={`badge badge-${player.status === 'Active' ? 'success' : 'danger'}`}>
                            {player.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-outline-primary btn-sm">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="col-xl-4 col-lg-5">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Upcoming Schedule</h6>
            </div>
            <div className="card-body">
                <ul className="list-group list-group-flush">
                    {upcomingSchedule.map((game, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                        <strong>vs {game.opponent}</strong>
                        <br />
                        <small>{game.date} at {game.location}</small>
                        </div>
                    </li>
                    ))}
                </ul>
                <div className="mt-3">
                    <button className="btn btn-primary btn-sm">Manage Schedule</button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
