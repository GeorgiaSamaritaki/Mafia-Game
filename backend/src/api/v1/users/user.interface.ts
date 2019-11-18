export interface User {
    name: string;
    role: string;
    avatar_path: string; //path in the assets file 
}

var users: Array<User> = [
    {
        name: "Alice",
        role: "",
        avatar_path: "player1.png"
    },
    {
        name: "George",
        role: "",
        avatar_path: "player2.png"
    },
    {
        name: "Maria",
        role: "",
        avatar_path: "player3.png"
    },
    {
        name: "Kiki",
        role: "",
        avatar_path: "player4.png"
    },
    {
        name: "Manolis",
        role: "",
        avatar_path: "player5.png"
    },
    {
        name: "Kosmas",
        role: "",
        avatar_path: "player6.png"
    },
        {
        name: "Renata",
        role: "",
        avatar_path: "player7.png"
    }
]

export { users };