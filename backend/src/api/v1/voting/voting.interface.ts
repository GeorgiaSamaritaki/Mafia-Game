import { User } from "../users/user.interface";
import { UsersController } from "../users/users.controller";

export interface Vote {
    fromWho: string,
    toWho: string,
    round: string
}

// var roundVotes: Array<Vote>;

export interface roundSum {
    day: string, //day1, night1 etc
    votes: Array<Vote>,
    dead: string //Who died
}


var roundVotes: Array<Vote> = [
    {
        fromWho: 'Alice',
        toWho: 'Maria',
        round: ''
    },
    {
        fromWho: 'George',
        toWho: 'Maria',
        round: ''
    },
    {
        fromWho: 'Maria',
        toWho: 'George',
        round: ''
    },
    {
        fromWho: 'Kiki',
        toWho: 'Maria',
        round: ''
    },
    {
        fromWho: 'Manolis',
        toWho: 'Renata',
        round: ''
    },
    {
        fromWho: 'Kosmas',
        toWho: 'George',
        round: ''
    },
    {
        fromWho: 'Renata',
        toWho: 'Maria',
        round: ''
    },
]

var voteHistory: Array<roundSum> = [
    {
        day: 'day1',
        votes: roundVotes,
        dead: 'Maria'
    }
];

export {roundVotes, voteHistory};