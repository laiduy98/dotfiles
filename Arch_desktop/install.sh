sudo pacman -Syu
sudo pacman -S neofetch neovim htop picom i3-gaps zsh git imwheel rofi feh ttf-freefont ttf-arphic-uming ttf-baekmuk neovim lxappearance lightdm-gtk-greeter-settings ibus ntp man noto-fonts-emoji gnome-keyring xarchiver qalculate-gtk dunst
curl -sS https://download.spotify.com/debian/pubkey_0D811D58.gpg | gpg --import -
yay -S polybar rambox google-chrome visual-studio-code-bin discord ibus-bamboo arc-gtk-theme pop-icon-theme skype pycharm datagrip spotify
systemctl enable ntpd
timedatectl set-ntp 1
sudo hwclock --systohc
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
git clone https://github.com/agkozak/zsh-z $ZSH_CUSTOM/plugins/zsh-z
