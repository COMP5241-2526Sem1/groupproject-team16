const cfg={
  resetCodeTtl:Number(process.env.RESET_CODE_TTL)||5*60*1000,
  resetTokenTtl:Number(process.env.RESET_TOKEN_TTL)||15*60*1000
}
module.exports=cfg


