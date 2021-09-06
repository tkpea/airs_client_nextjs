import dayjs from "dayjs"

import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)

import 'dayjs/locale/ja';
dayjs.locale('ja');

export default dayjs