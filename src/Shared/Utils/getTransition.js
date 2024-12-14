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

  ["list", "Список виртуальных машин 86Box"],
  ["createForm", "Укажите имя виртуальной машины:"],
  ["editMode", "для редактирования"],

  ["emptyList", "В выбранном каталоге отсутствуют директории"],
]);

let defaultDictionary;

export default function getTransition(
  systemDictionary,
) {
  return (dictionaryKey) => {
    try {
      if (systemDictionary)
        defaultDictionary = new Map(Object.entries(JSON.parse(systemDictionary)));
      else defaultDictionary = dictionary;
    } catch {
      defaultDictionary = dictionary;
    }
    return defaultDictionary.get(dictionaryKey) || dictionaryKey;
  }
}
