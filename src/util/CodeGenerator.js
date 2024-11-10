import { computed } from 'vue';
import { useLoading } from '../common';
import useCountDown from './useCountDown';
import {REGEXP_EMAIL} from '../config/regex';
import {HttpManager} from "@/api";
import {ElMessage} from "element-plus";

export default function useSmsCode(){
    const { loading, startLoading, endLoading } = useLoading();
    const { counts, start, isCounting } = useCountDown(60);

    const initLabel = '获取验证码';
    const countingLabel = (second) => `${second}秒后重新获取`;
    const label = computed(() => {
        let text = initLabel;
        if (loading.value) {
            text = '';
        }
        if (isCounting.value) {
            text = countingLabel(counts.value);
        }
        return text;
    });

    /** 判断邮箱格式是否正确 */
    function isEmailValid(email) {
        let valid = true;
        if (email === '') {
            ElMessage({
                message: '邮箱不能为空！',
                type:'error',
                grouping:true
            })
            valid = false;
        } else if (!REGEXP_EMAIL.test(email)) {
            ElMessage({
                message: '邮箱格式错误！',
                type:'error',
                grouping:true
            })
            valid = false;
        }
        return valid;
    }

    /**
     * 获取短信验证码
     * @param email
     */
    function getSmsCode(email) {
        console.log(email)
        const valid = isEmailValid(email);
        if (!valid || loading.value) return;
        startLoading();
        //向后端发起发送邮箱验证码请求
        const data =  HttpManager.sengEmail(email);
        if (data) {
            ElMessage({
                message: '验证码发送成功！',
                type:'success',
            })
            start();
        }
        endLoading();
    }

    return {
        label,
        start,
        isCounting,
        getSmsCode,
        loading
    };
}