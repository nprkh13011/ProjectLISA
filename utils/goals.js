const dailyGoals = [
    {
        "info": "Recharge before device reaches 20%",   // what the goal is
        "points": 100,  // total possible points (log: battery)
    },
    {
        "info": "Use energy-saving mode at least 75% of the time",  // what the goal is
        "points": 100,  // total possible points (log: energySaver, screenTime)
    },
    {
        "info": "Keep idle time below 45 minutes",  // what the goal is
        "points": 100,  // total possible points (log: idleTime)
    },
    {
        "info": "Keep average screen brightness below 75%", // what the goal is
        "points": 100,  // total possible points (log: averageBrightness)
    }
];
const weeklyGoals = [
    {
        "info": "Reduce charging time by 10%", // what the goal is
        "points": 500,  // total possible points (log: datetime)
    },
    {
        "info": "Remove 100 MB of storage space",  // what the goal is
        "points": 500,  // total possible points (log: storage space)
    },
];

const allGoals = [...dailyGoals, ...weeklyGoals];

export const getPointsByGoal = goal => {
    if (!goal || typeof goal != "string")
        return 0; // the goal doesn't exist, so return 0
    else {
        const currentGoal = allGoals.find(currGoal => currGoal.info == goal);
        const points = currentGoal ? currentGoal.points : 0; // either "points" or 0, depends on if the goal exists
        return points;
    }
};

export const getAllGoalsInfo = () => allGoals.map(goal => goal.info);

export const getGoalByInfo = goal => {
    if (!goal || typeof goal != "string")
        throw "Error: Device goal is invalid and does not exist";
    else {
        const currentGoal = allGoals.find(currGoal => currGoal.info == goal);
        return currentGoal;
    }
};