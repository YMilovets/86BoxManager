export default function getTransition(dictionary = null) {
    const defaultDictionary = new Map([
      ["yes", "Да"],
      ["no", "Нет"],
      ["version", "Версия программы"],
      ["about", "О приложении 86BoxManager"],
      [
        "description",
        "86BoxManager - приложение для создания и управления настройками виртуальных машин 86Box.",
      ],
      ["copyright", "Все права защищены"],
      [
        "closeMessage",
        "Для закрытия окна программы выключите все запущенные виртуальные машины",
      ],
      [
        "noExistsMachineMessage",
        "Виртуальной машины $machineName больше не существует",
      ],
      ["addSuccessMachineTitle", "Добавление виртуальной машины"],
      [
        "addSuccessMachineMessage",
        "Виртуальная машина $machineName была успешно добавлена",
      ],
      ["removeConfirmMachineTitle", "Удалить виртуальную машину"],
      [
        "removeConfirmMachineMessage",
        "Вы действительно хотите удалить машину $machineName",
      ],
      ["removeSuccessMachineTitle", "Успешное удаление"],
      [
        "removeSuccessMachineMessage",
        "Виртуальная машина $machineName успешно удалена",
      ],
      ["removeErrorMachineTitle", "Ошибка удаления вирутальной машины"],
      [
        "removeErrorMachineMessage",
        "Не удалось удалить виртуальную машину $machineName",
      ],
      ["changeConfirmMachineTitle", "Изменить имя виртуальной машины"],
      [
        "changeConfirmMachineMessage",
        "Вы действительно хотите переименовать название машины $machineName на $newMachineName",
      ],
      ["changeSuccessMachineTitle", "Успешное переименование"],
      [
        "changeSuccessMachineMessage",
        "Виртуальная машина $machineName успешно переименована в $newMachineName",
      ],
      ["changeErrorMachineTitle", "Ошибка переименования виртуальной машины"],
      [
        "changeErrorMachineMessage",
        "Не удалось переименовать виртуальную машину $machineName",
      ],
      [
        "changeErrorExistMachineMessage",
        "Виртуальная машина $machineName уже существует. Придумайте новое название",
      ],
      [
        "changeErrorNonExistMachineTitle",
        "Не удалось переименовать виртуальную машину $machineName",
      ],
      [
        "changeErrorNonExistMachineMessage",
        "Виртуальной машины $machineName больше не существует. Переименование машины было прервано, список машин будет обновлен",
      ],
      ["firstLaunch", "Ошибка параметров приложения"],
      [
        "firstLaunchMessage",
        "Произведен первый запуск программы 86BoxManager, или настройки были сброшены. Пожалуйста, настройте каталог размещения виртуальных машин и расположение программы 86Box",
      ],
      [
        "failLaunchApp",
        "Указанный в настройках путь к приложению 86Box не существует. Измените настройки приложения\nКод ошибки: $errorCode",
      ],
      [
        "failSegmentation",
        "Процесс виртуальной машины 86Box пытался обратиться к защищенной области памяти и был немедленно завершен\nКод ошибки: $errorCode",
      ],
      [
        "removeErrorNonExistMachineTitle",
        "Не удалось удалить виртуальную машину $machineName",
      ],
      [
        "removeErrorNonExistMachineMessage",
        "Виртуальной машины $machineName больше не существует. Удаление машины было прервано, список машин будет обновлен",
      ],
      [
        "updateListAfterCloseDialogTitle",
        "Виртуальной машины больше не существует",
      ],
      [
        "updateListAfterCloseDialogMessage",
        "Виртуальной машины $machineName больше не существует, список машин будет обновлен",
      ],
      ["removeErrorPathMachineTitle", "Ошибка удаления вирутальной машины"],
      [
        "removeErrorPathMachineMessage",
        "Не удалось удалить виртуальную машину $machineName, поскольку не существует директории виртуальных машин $pathMachines",
      ],
      [
        "renameErrorPathMachineTitle",
        "Ошибка переименования виртуальной машины",
      ],
      [
        "renameErrorPathMachineMessage",
        "Не удалось переименовать виртуальную машину $machineName, поскольку не существует директории виртуальных машин $pathMachines",
      ],
      [
        "updateMachinesAfterCloseProcessTitle",
        "Список виртуальных машин был обновлен",
      ],
      [
        "updateMachinesAfterCloseProcessMessage",
        "Поскольку папка виртуальных машин $prevPathMachines была заменена на $currentPathMachines, список виртуальных машин был обновлен",
      ],
      [
        "renameErrorProcessMachineTitle",
        "Ошибка переименования виртуальной машины",
      ],
      [
        "renameErrorProcessMachineMessage",
        "Переименование виртуальной машины $machineName отменено, поскольку запущен процесс виртуальной машины",
      ],
      ["open", "Открыть папку"],
      [
        "changeLanguageErrorTitle",
        "Не удалось изменить выбранные настройки языка приложения",
      ],
      [
        "changeLanguageErrorMessage",
        "Поскольку больше не существует настройки языка $language, был восстановлен предыдущий параметр",
      ],
      [
        "changeLanguageCorruptFileTitle",
        "Не удалось изменить выбранные настройки языка приложения",
      ],
      [
        "changeLanguageCorruptFileMessage",
        "Поскольку файл настройки языка $language был поврежден, был восстановлен предыдущий параметр",
      ],
    ]);
    return (dictionaryKey, renderDict = (result) => result) => {
      if (dictionary)
        return (
          renderDict(
            new Map(Object.entries(JSON.parse(dictionary))).get(dictionaryKey) ||
              defaultDictionary.get(dictionaryKey) ||
              dictionaryKey
          ) || dictionaryKey
        );
      return renderDict(defaultDictionary.get(dictionaryKey)) || dictionaryKey;
    };
  }
  