import dayjs from "dayjs"

// 相対日時のプラグインを有効化
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)

// 日本語で ◯日前 のように表示する場合
import 'dayjs/locale/ja';
dayjs.locale('ja');

export default dayjs