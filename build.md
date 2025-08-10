# Инструкция по сборке 86Box на Debian 12

## Установка необходимых зависимостей

```
sudo apt install build-essential cmake extra-cmake-modules pkg-config \
ninja-build libfreetype-dev libsdl2-dev libpng-dev libopenal-dev \
librtmidi-dev libfluidsynth-dev libsndfile1-dev qtbase5-dev \
qtbase5-private-dev qttools5-dev libevdev-dev libxkbcommon-dev \
libxkbcommon-x11-dev libslirp-dev
```

## Клонирование репозитория

`git clone https://github.com/86Box/86Box.git`

## Сборка проекта

`cd 86Box`

`mkdir build`

`cd build`

`cmake ..`

`make`


## Установка 86Box

После завершения сборки выполнить команду установки:

`sudo make install`

## Запуск 86Box

`86Box`