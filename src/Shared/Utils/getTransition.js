const dictionary = new Map([
  [
    "errorElectronAPI",
    "Функции недоступны, поскольку запущен макет приложения, а не исполняемый файл",
  ],
  ["nameMachineField", "Введите имя виртуальной машины"],
  [
    "errorMachineExists",
    "Указанная виртуальная машина уже существует. Введите новое имя",
  ],
  ["save", "Сохранить"],
  ["open", "Открыть папку"],
  ["cancel", "Отменить"],
  ["remove", "Удалить"],
  ["edit", "Редактировать"],
  ["create", "Создать"],
  ["update", "Обновить"],
  ["preference", "Настройки"],
  ["changeLanguage", "Изменение языка"],
  ["changeTheme", "Изменение темы"],
  ["choose", "Выбрать"],
  ["list", "Список виртуальных машин 86Box"],
  ["createForm", "Укажите имя виртуальной машины:"],
  ["editMode", "для редактирования"],
  ["emptyList", "В выбранном каталоге отсутствуют директории"],
  ["destinationAppFolder", "Расположение исполняемого файла программы 86Box"],
  ["configFolder", "Местоположение каталога настроек виртуальных машин"],
  ["aboutBtn", "О приложении"],
  ["selectedFolder", "Выбранная папка"],
  ["chooseLanguage", "Выберите язык"],
  [
    "errorDestinationAppFolder",
    "Введите команду или путь до исполняемого файла 86Box",
  ],
  ["errorConfigFolder", "Введите местоположение настроек вирутальных машин"],
  [
    "noExistFolder",
    "Указанная в настройках директория не существует. Измените настройку каталога местоположения виртуальных машин",
  ],
  [
    "clearFormAfterUpdateTitle",
    "Форма редактирования сброшена после обновления",
  ],
  [
    "clearFormAfterUpdateMessage",
    "Заполненные поля формы была очищены после обновления, поскольку папка виртуальных машин $prevPathMachines была заменена на $currentPathMachines",
  ],
  [
    "clearFormAfterRenameMachineTitle",
    "Форма редактирования сброшена при попытке переименования",
  ],
  [
    "clearFormAfterRenameMachineMessage",
    "Заполненные поля формы была очищены при попытке переименования, поскольку папка виртуальных машин $prevPathMachines была заменена на $currentPathMachines",
  ],
  [
    "clearFormAfterRemoveMachineTitle",
    "Форма редактирования сброшена при попытке удаления машины",
  ],
  [
    "clearFormAfterRemoveMachineMessage",
    "Заполненные поля формы была очищены при попытке удаления машины, поскольку папка виртуальных машин $prevPathMachines была заменена на $currentPathMachines",
  ],
  ["preventLaunchMachineTitle", "Запуск виртуальной машины был прерван"],
  [
    "preventLaunchMachineMessage",
    "Поскольку папка виртуальных машин $prevPathMachines была заменена на $currentPathMachines, запуск виртуальной машины был прерван",
  ],
  [
    "errorMachineProcessExists",
    "Создание виртуальной машины с данным именем невозможно, поскольку запущен процесс виртуальной машины с тем же названием",
  ],
  [
    "destinationWindowsMessage",
    `Чтобы настроить расположение исполняемого файла программы 86Box, нужно скачать архив с программой виртуальных машин 86Box по ссылке $downloadURL, распаковать в любую директорию и выбрать файл 86Box.exe в Windows.`,
  ],
  [
    "destinationLinuxMessage",
    "Ознакомьтесь с инструкцией по ссылке $instructionURL для установки в систему Debian программы виртуальных машин 86Box. Затем просто укажите команду 86Box в настройку расположения исполняемого файла программы 86Box.",
  ],
  ["fieldIsChanged", "Поле изменено"],

  ["dark", "Темная"],
  ["light", "Светлая"],
  ["default", "Системная"],
]);

let defaultDictionary;

export default function getTransition(systemDictionary) {
  return (dictionaryKey) => {
    try {
      const localization = JSON.parse(systemDictionary);
      if (systemDictionary && localization[dictionaryKey])
        defaultDictionary = new Map(Object.entries(localization));
      else defaultDictionary = dictionary;
    } catch {
      defaultDictionary = dictionary;
    }
    return defaultDictionary.get(dictionaryKey) || dictionaryKey;
  };
}
