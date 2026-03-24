#![no_std]

use soroban_sdk::{contract, contractimpl, Env, Symbol, Vec, Address, log};

#[contract]
pub struct LotteryContract;

#[contractimpl]
impl LotteryContract {

    // Initialize contract with admin
    pub fn init(env: Env, admin: Address) {
        admin.require_auth();

        env.storage().instance().set(&Symbol::short("ADMIN"), &admin);

        let players: Vec<Address> = Vec::new(&env);
        env.storage().instance().set(&Symbol::short("PLAYERS"), &players);
    }

    // Enter lottery
    pub fn enter(env: Env, player: Address) {
        player.require_auth();

        let key = Symbol::short("PLAYERS");

        let mut players: Vec<Address> =
            env.storage().instance().get(&key).unwrap_or(Vec::new(&env));

        // Prevent duplicate entry
        if players.contains(&player) {
            panic!("Player already entered");
        }

        players.push_back(player);
        env.storage().instance().set(&key, &players);

        log!(&env, "Player entered lottery");
    }

    // Get all players
    pub fn get_players(env: Env) -> Vec<Address> {
        env.storage()
            .instance()
            .get(&Symbol::short("PLAYERS"))
            .unwrap_or(Vec::new(&env))
    }

    // Pick winner (only admin)
    pub fn pick_winner(env: Env, caller: Address) -> Address {
        caller.require_auth();

        let admin: Address = env.storage()
            .instance()
            .get(&Symbol::short("ADMIN"))
            .unwrap();

        if caller != admin {
            panic!("Only admin can pick winner");
        }

        let key = Symbol::short("PLAYERS");
        let players: Vec<Address> =
            env.storage().instance().get(&key).unwrap_or(Vec::new(&env));

        if players.len() == 0 {
            panic!("No players in lottery");
        }

        // Pseudo randomness (still basic)
        let timestamp = env.ledger().timestamp();
        let index = (timestamp % players.len() as u64) as u32;

        let winner = players.get(index).unwrap();

        // Reset players
        let empty: Vec<Address> = Vec::new(&env);
        env.storage().instance().set(&key, &empty);

        log!(&env, "Winner selected");

        winner
    }
}