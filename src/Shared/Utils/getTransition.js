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
  ["cancel", "Отменить"],
  ["remove", "Удалить"],
  ["edit", "Редактировать"],
  ["create", "Создать"],
  ["update", "Обновить"],
  ["preference", "Настройки"],
  ["changeLanguage", "Изменение языка"],
  ["choose", "Выбрать"],
  ["list", "Список виртуальных машин 86Box"],
  ["createForm", "Укажите имя виртуальной машины:"],
  ["editMode", "для редактирования"],
  ["emptyList", "В выбранном каталоге отсутствуют директории"],
  ["destinationAppFolder", "Расположение исполняемого файла программы 86Box"],
  ["configFolder", "Местоположение каталога настроек виртуальных машин"],
  [
    "errorDestinationAppFolder",
    "Введите команду или путь до исполняемого файла 86Box",
  ],
  ["errorConfigFolder", "Введите местоположение настроек вирутальных машин"],
  [
    "noExistFolder",
    "Указанная в настройках директория не существует. Измените настройку каталога местоположения виртуальных машин",
  ],
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
