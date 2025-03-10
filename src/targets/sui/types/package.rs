use anyhow::{ensure, Result};

use move_binary_format::CompiledModule;
use move_core_types::account_address::AccountAddress;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use starcoin_crypto::hash::{CryptoHash, CryptoHasher};

use crate::targets::sui::types::module::Module;
use crate::targets::sui::types::script::ScriptFunction;
use crate::utils::bcs_ext;

#[derive(
    Clone, Debug, Hash, Eq, PartialEq, Serialize, Deserialize, CryptoHasher, CryptoHash, JsonSchema,
)]
pub struct Package {
    ///Package's all Module must at same address.
    #[schemars(with = "String")]
    package_address: AccountAddress,
    modules: Vec<Module>,
    init_script: Option<ScriptFunction>,
}

impl Package {
    pub fn new(modules: Vec<Module>, init_script: Option<ScriptFunction>) -> Result<Self> {
        ensure!(!modules.is_empty(), "must at latest one module");
        let package_address = Self::parse_module_address(&modules[0])?;
        Ok(Self {
            package_address,
            modules,
            init_script,
        })
    }

    #[allow(dead_code)]
    pub fn new_with_modules(modules: Vec<Module>) -> Result<Self> {
        Self::new(modules, None)
    }

    #[allow(dead_code)]
    pub fn new_with_module(module: Module) -> Result<Self> {
        Ok(Self {
            package_address: Self::parse_module_address(&module)?,
            modules: vec![module],
            init_script: None,
        })
    }

    fn parse_module_address(module: &Module) -> Result<AccountAddress> {
        let compiled_module = CompiledModule::deserialize_with_defaults(module.code())?;
        Ok(*compiled_module.address())
    }

    #[allow(dead_code)]
    pub fn set_init_script(&mut self, script: ScriptFunction) {
        self.init_script = Some(script);
    }

    #[allow(dead_code)]
    pub fn add_module(&mut self, module: Module) -> Result<()> {
        self.modules.push(module);
        Ok(())
    }

    #[allow(dead_code)]
    pub fn package_address(&self) -> AccountAddress {
        self.package_address
    }

    #[allow(dead_code)]
    pub fn modules(&self) -> &[Module] {
        &self.modules
    }

    #[allow(dead_code)]
    pub fn init_script(&self) -> Option<&ScriptFunction> {
        self.init_script.as_ref()
    }

    #[allow(dead_code)]
    pub fn into_inner(self) -> (AccountAddress, Vec<Module>, Option<ScriptFunction>) {
        (self.package_address, self.modules, self.init_script)
    }
}
