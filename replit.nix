{ pkgs }: {
  deps = [
    pkgs.nodejs_18
    pkgs.nodePackages.typescript
    pkgs.nodePackages.typescript-language-server
    pkgs.sqlite
    pkgs.openssl
  ];
  
  env = {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.openssl
    ];
  };
}