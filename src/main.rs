use std::env;
use std::panic;

use clap::Parser;

use move_web::cli::{CliOptions, Commands};

fn hook_impl(info: &panic::PanicInfo) {
    println!("[DEBUG] info: {}", info);
}

fn parse_address_map(address_map: &str) -> Result<(&str, &str), String> {
    let mut tokens = address_map.split(':');

    match tokens.next() {
        Some(name) => match tokens.next() {
            Some(address) => Ok((name, address)),
            None => Err("Not found address name in address_map".to_string()),
        },
        None => Err("Not found address in address_map".to_string()),
    }
}

fn main() -> std::io::Result<()> {
    panic::set_hook(Box::new(hook_impl));

    let pwd = env::var("PWD").expect("must has set PWD env");
    println!("[DEBUG]pwd: {:?}", pwd);

    let args = CliOptions::parse();

    match args.commands {
        Commands::Build {
            dependency_dirs,
            address_maps,
            targets,
            test,
            init_function,
        } => {
            let dependency_dirs = match dependency_dirs {
                Some(ref v) => v.split(',').collect(),
                None => vec![],
            };

            let address_maps = match address_maps {
                Some(ref v) => v
                    .split(',')
                    .map(|x: &str| parse_address_map(x).unwrap())
                    .collect(),
                None => vec![], // None => vec!<&str, &str>[],
            };

            let targets = match targets {
                Some(ref v) => v.split(',').collect(),
                None => vec!["sui"],
            };

            let test_mode = test.unwrap_or(false);

            let init_function = init_function.unwrap_or("".to_string());

            let ret = move_web::build_package(
                &pwd,
                &dependency_dirs,
                &address_maps,
                &targets,
                test_mode,
                init_function.as_str(),
            );
            match ret {
                Ok(()) => {
                    println!("[DEBUG]build package ok");
                }
                Err(e) => {
                    eprintln!("[DEBUG]build package error: {:?}", e);
                }
            }
        }

        Commands::Disassemble(args) => move_web::disassemble(args),
    }

    Ok(())
}
