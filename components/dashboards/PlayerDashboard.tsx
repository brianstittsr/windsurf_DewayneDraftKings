import React from 'react';

const PlayerDashboard = () => {
  // Mock data - in the future, this will be fetched based on the logged-in player
  const playerStats = {
    gamesPlayed: 8,
    touchdowns: 5,
    yards: 345,
    tackles: 12,
    interceptions: 2,
  };

  const teamInfo = {
    name: 'Vipers',
    nextGame: 'Saturday, Nov 8th @ 2:00 PM vs. Raiders',
    record: '5-3',
  };

  const upcomingSchedule = [
    { opponent: 'Raiders', date: 'Nov 8, 2025', location: 'Field 2' },
    { opponent: 'Titans', date: 'Nov 15, 2025', location: 'Field 1' },
  ];

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Player Dashboard</h1>

      <div className="row">
        {/* Player Stats */}
        <div className="col-xl-6 col-lg-7 mb-4">
          <div className="card shadow h-100">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">My Season Stats</h6>
            </div>
            <div className="card-body">
              <div className="row no-gutters align-items-center mb-2">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-uppercase mb-1">Games Played</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{playerStats.gamesPlayed}</div>
                </div>
              </div>
              <div className="row no-gutters align-items-center mb-2">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-uppercase mb-1">Touchdowns</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{playerStats.touchdowns}</div>
                </div>
              </div>
              <div className="row no-gutters align-items-center mb-2">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-uppercase mb-1">Receiving Yards</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{playerStats.yards}</div>
                </div>
              </div>
               <div className="row no-gutters align-items-center mb-2">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-uppercase mb-1">Tackles</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{playerStats.tackles}</div>
                </div>
              </div>
               <div className="row no-gutters align-items-center mb-2">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-uppercase mb-1">Interceptions</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{playerStats.interceptions}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Information and Schedule */}
        <div className="col-xl-6 col-lg-5 mb-4">
          <div className="card shadow h-100">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">My Team: {teamInfo.name} ({teamInfo.record})</h6>
            </div>
            <div className="card-body">
              <h6 className="font-weight-bold">Next Game</h6>
              <p>{teamInfo.nextGame}</p>
              <hr />
              <h6 className="font-weight-bold">Upcoming Schedule</h6>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
