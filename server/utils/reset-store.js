const crypto=require('crypto')
const { resetCodeTtl,resetTokenTtl }=require('./app-config')
const store=new Map()
const now=()=>Date.now()
const pad=x=>x.toString().padStart(6,'0')
const create=email=>{
  const code=pad(Math.floor(Math.random()*1e6))
  const token=crypto.randomUUID()
  store.set(email,{code,token,codeExpire:now()+resetCodeTtl,tokenExpire:now()+resetTokenTtl,verified:false})
  return {code,token}
}
const verify=(email,code)=>{
  const entry=store.get(email)
  if(!entry||entry.codeExpire<now()||entry.code!==code) return null
  entry.verified=true
  return entry.token
}
const consume=(email,token)=>{
  const entry=store.get(email)
  if(!entry||!entry.verified||entry.token!==token||entry.tokenExpire<now()) return false
  store.delete(email)
  return true
}
module.exports={create,verify,consume}


