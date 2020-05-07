# Dotfiles and Arch Linux installation instruction from scratch

![Screenshot](/Docs/screenshot.png)

## Arch Linux installation instruction

### Install Arch
* Check disk and wifi
```
ping -c 3 google.com
wifi-menu
lsblk
```
* Partition the disk, make /boot/efi and /
```
cfdisk /dev/sda
mkfs.fat -F32 /dev/sda1
mkfs.ext4 /dev/sda2
```
* Install Arch on disk
```
mount /dev/sda2 /mnt
lsblk
pacstrap -i /mnt base base-devel linux linux-firmware sudo vim
genfstab -U -p /mnt >> /mnt/etc/fstab
arch-chroot /mnt /bin/bash
```
* Configure things on the disk
```
nano /etc/locale.gen # choose us_utf8
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
echo "LANG=en_US.UTF-8" > /etc/locale.conf
hwclock --systohc --utc
date
```
* Configure device name 
```
echo HPOmen > /etc/hostname
nano /etc/hosts
127.0.1.1 localhost.localdomain HPOmen
```

* Network manager
```
pacman -S networkmanager
systemctl enable NetworkManager
```

* Set root password
```
passwd
```

* Install grub and bootloader
```
pacman -S grub efibootmgr
mkdir /boot/efi
mount /dev/sda1 /boot/efi
lsblk # to check if everything is mounted correctly
grub-install --target=x86_64-efi --bootloader-id=GRUB --efi-directory=/boot/efi --removable
pacman -Syu os-prober   # to choose windows on grub
grub-mkconfig -o /boot/grub/grub.cfg
```

* Reboot
```
exit
umount -R /mnt
reboot
```

### Post Arch install
* Create swap
```
fallocate -l 3G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

free -h
```

* Add user
```
useradd -m -g users -G wheel -s /bin/bash laiduy98
passwd laiduy98
EDITOR=vim visudo //uncomment
# %wheel ALL=(ALL) ALL
```

## i3 install instruction

### Arch
* Install nessecary package
```
sudo pacman -S pulseaudio pulseaudio-alsa xorg xorg-xinit xorg-server rxvt-unicode dialog wpa_supplicant openssl lightdm lightdm-gtk-greeter i3-gaps

sudo pacman -S firefox i3status gnome-terminal rofi zsh arandr feh light polybar

sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" # install zsh
```
* Exec i3
```
echo "exec i3" > ~/.xinitrc
systemctl enable lightdm
```
* Zsh plugin
```
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```
* Make light work
```
sudo chmod 4755 /usr/bin/light
```
* Change mouse cursor theme
[https://wiki.archlinux.org/index.php/Cursor_themes]

### Ubuntu
With ubuntu, you have to install i3-gaps, i3lock and polybar from source

* i3-gaps

[https://github.com/pasiegel/i3-gaps-install-ubuntu]
```
sudo apt install libxcb1-dev libxcb-keysyms1-dev libpango1.0-dev libxcb-util0-dev libxcb-icccm4-dev libyajl-dev libstartup-notification0-dev libxcb-randr0-dev libev-dev libxcb-cursor-dev libxcb-xinerama0-dev libxcb-xkb-dev libxkbcommon-dev libxkbcommon-x11-dev autoconf xutils-dev libtool libxcb-shape0-dev

cd /tmp
git clone https://www.github.com/Airblader/i3 i3-gaps
cd i3-gaps
git checkout gaps && git pull
autoreconf --force --install
rm -rf build
mkdir build
cd build
../configure --prefix=/usr --sysconfdir=/etc
make
sudo make install
```
**Extra**: 
```
sudo apt-get install wget ranger mediainfo highlight tmux calcurse  newsbeuter moc qutebrowser imagemagick transmission-cli atool xcompmgr blender pinta gimp  markdown mupdf evince audacity vim-latexsuite rsync syncthing cups screenfetch scrot unzip unrar biber ntfs-3g deepin-terminal zip irssi unzip
```
* i3lock

[https://github.com/Lixxia/i3lock]

Make sure you have the following libraries installed in addition to the packages in the requirements section below.

libxkbcommon-dev libxkbcommon-x11-dev libpam0g-devl  libjsoncpp-dev
```
git clone https://github.com/Lixxia/i3lock.git
cd i3lock
autoreconf -fi
mkdir -p build && cd build
../configure
make && sudo make install
```
* Polybar
```
sudo apt-get install cmake cmake-data libcairo2-dev libxcb1-dev libxcb-ewmh-dev libxcb-icccm4-dev libxcb-image0-dev libxcb-randr0-dev libxcb-util0-dev libxcb-xkb-dev pkg-config python-xcbgen xcb-proto libxcb-xrm-dev  libasound2-dev libmpdclient-dev libiw-dev libcurl4-openssl-dev libpulse-dev libxcb-composite0-dev xcb libxcb-ewmh2

git clone https://github.com/jaagr/polybar.git

cd polybar && ./build.sh
```
## Apply dotfiles
Clone this repo and put things in place

## Something to mention

* Choose class with ```xprop``` to assign workspace
* Working with xinput examples
```
xinput list
xinput list prop <id>
xinput list-props id to list properties, xinput set-prop "SynPS/2 Synaptics TouchPad" "libinput Accel Speed" 0.5
```