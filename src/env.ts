export const getEnv = () =>{
    const {
        SLACK_INCOMING_WEBHOOK_URL,
        DRY_RUN,
    } = process.env;
    if(!SLACK_INCOMING_WEBHOOK_URL){
        throw new Error("SLACK_INCMING_WEBHOOK_URL is not set.");
    }

    return {
        SLACK_INCOMING_WEBHOOK_URL,
        DRY_RUN: DRY_RUN === 'true' ? true:false
    };
};