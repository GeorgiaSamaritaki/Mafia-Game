export interface User {
    name: string;
    role: string;
    avatar_path: string; //path in the assets file
    position: number; //position on the table
    dead: string; //alive, night, day 
}

var users: Array<User> = [
    {
        name: "Alice",
        role: "undefined",
        avatar_path: "player1.png",
        position: -1,
        dead: "alive"
    },
    {
        name: "George",
        role: "undefined",
        avatar_path: "player2.png",
        position: -1,
        dead: "alive"
    },
    {
        name: "Maria",
        role: "undefined",
        avatar_path: "player3.png",
        position: -1,
        dead: "alive"
    },
    {
        name: "Kiki",
        role: "undefined",
        avatar_path: "player4.png",
        position: -1,
        dead: "alive"
    },
    {
        name: "Manolis",
        role: "undefined",
        avatar_path: "player5.png",
        position: -1,
        dead: "alive"
    },
    {
        name: "Kosmas",
        role: "undefined",
        avatar_path: "player6.png",
        position: -1,
        dead: "alive"
    },
    {
        name: "Renata",
        role: "undefined",
        avatar_path: "player7.png",
        position: -1,
        dead: "alive"
    }
]

export { users };