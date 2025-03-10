mod types;

use move_compiler::compiled_unit::CompiledUnit;

use crate::targets::target::Target;
use crate::utils::bcs_ext;
use anyhow::{Error, Result};
use starcoin_crypto::hash::PlainCryptoHash;
use std::path::Path;
use types::function::FunctionId;
use types::module::Module;
use types::package::Package;
use types::script::ScriptFunction;

#[derive(Default)]
pub struct SuiTarget {}

impl Target for SuiTarget {
    fn output(self, units: &[CompiledUnit], dest_path: &Path, init_function: &str) -> Result<()> {
        let mut modules = vec![];

        for (_i, mv) in units.iter().enumerate() {
            let code = mv.serialize();
            modules.push(Module::new(code));
        }
        
        let mut init_script: Option<ScriptFunction> = None;
        if !init_function.is_empty() {
            let func = FunctionId::from(init_function);
            init_script = match &func {
                Ok(script) => {
                    let script_function = script.clone();
                    Some(ScriptFunction::new(
                        script_function.module,
                        script_function.function,
                        vec![],
                        vec![],
                    ))
                }
                _ => anyhow::bail!("Found script in modules -- this shouldn't happen"),
            };
        }

        save_release_package(dest_path, modules, init_script)?;
        Ok(())
    }
}

fn save_release_package(
    root_dir: &Path,
    modules: Vec<Module>,
    init_script: Option<ScriptFunction>,
) -> Result<(), Error> {
    let mut release_dir = root_dir.join("release");
    
    let p = Package::new(modules, init_script)?;
    
    let blob = bcs_ext::to_bytes(&p)?;
    
    let release_path = {
        std::fs::create_dir_all(&release_dir)?;
        release_dir.push(format!("{}.blob", "package"));
        release_dir.to_path_buf()
    };
    std::fs::write(&release_path, blob)?;
    
    let release_hash_path = {
        release_dir.pop();
        release_dir.push("hash.txt");
        release_dir
    };

    let hash = p.crypto_hash().to_string();
    
    std::fs::write(release_hash_path, &hash)?;
    
    println!("build done, saved: {}, {}", release_path.display(), hash);

    Ok(())
}
