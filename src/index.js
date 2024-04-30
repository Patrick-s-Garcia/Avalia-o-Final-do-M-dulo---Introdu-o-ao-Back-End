import express, { json, request, response } from "express";
import cors from "cors"
import bcrypt from "bcrypt"
import { emit } from "nodemon";

const app = express()

app.use(cors())

app.use(express.json())

app.listen(3333, () => console.log("Servidor rodando na porta 3333"))


let users = []

let massage = []

let nextMassage = 1

let nextPerson = 1

let emailLoggedIn = false

// ------------------------------------LOGIN-----------------------------------------

app.get('/', (request,response)=>{

    response.status(200).send(JSON.stringify({ Mensagem: `Bem vindo à aplicação` }))
  
  })

app.post('/signup',async (request,response)=>{

    const data = request.body
  
    const nome = data.nome
    const email = data.email
    const password = data.password
  
    if(!nome){
        response.status(400).send(JSON.stringify({ Mensagem: "Por favor, verifique se passou o nome" }))
      }

    if(!email){
      response.status(400).send(JSON.stringify({ Mensagem: "Por favor, verifique se passou o email" }))
    }
  
    if(!password){
      response.status(400).send(JSON.stringify({ Mensagem: "Por favor, verifique se passou a senha" }))
    }
  
    const emailCheck = users.find((admin)=> admin.email === email)
  
    if(emailCheck   ){
      response.status(400).send(JSON.stringify({ Mensagem: "Email já cadastrado, insira outro." }))
    }
  
    const encryptPassword = await bcrypt.hash(password,10)
    
    let newUser ={
      id : nextPerson,
      nome: data.nome,
      email : data.email, 
      password :encryptPassword
    }
  
    users.push(newUser)
  
    nextPerson++
  
    response.status(201).send(JSON.stringify({ Mensagem: `Seja bem vindo ${nome} ! Pessoa usuária registrada com sucesso!` }))
  
  })

app.post('/login',async(request,response)=>{

    const data = request.body 
  
    const email = data.email 
    const password = data.password
  
    if(!email){
      response.status(400).send(JSON.stringify({ Mensagem: "Insira um e-mail válido" }))
    }
  
    if(!password){
      response.status(400).send(JSON.stringify({ Mensagem: "Insira uma senha válido" }))
    }
  
  
    const emailCheck = users.find(admin =>admin.email === email)
  
    if(!emailCheck){ 
        response.status(400).send(JSON.stringify({ Mensagem: "Email não encontrado no sistema, verifique ou crie uma conta" }))
      }

    const passwordVerification = await bcrypt.compare(password, emailCheck.password)
  
    if(!passwordVerification){ 
      response.status(400).send(JSON.stringify({ Mensagem: "Senha incorreta!" }))
    }
  
    emailLoggedIn = emailCheck.email

    response.status(200).send(JSON.stringify({ Mensagem: `Seja bem vindo ${emailCheck.nome} ! Pessoa usuária logada com sucesso!` }))
    
  })


// -------------------------------------RECADOS--------------------------------------



app.post('/massage', (request, response) => {
    
    const data = request.body
    
    const title = data.title
    const description = data.description

    if(!title){
        response.status(400).send('Passe um título válido')
    }
    if(!description){
        response.status(400).send('Passe uma descrição válida')
    }
    
    if(!emailLoggedIn){
        response.status(404).send("Email não encontrado, verifique ou crie uma conta")
    }

    let newMassage = {
        email : emailLoggedIn,
        id : nextMassage,
        title : data.title,
        description : data.description
    }

    response.status(201).send(`
    Mensagem criada com sucesso! ${JSON.stringify(newMassage)}
    `)

    massage.push(newMassage)

    nextMassage ++ 



})

app.get('/carros', (request, response) => {

    if(carros.length === 0){
        response.status(400).send(JSON.stringify("Mensagem: Não existem carros registrados."))
    }
    const dadosMapeados = carros.map((carro) => `| ID: ${carro.id} | Modelo: ${carro.modelo} | Marca: ${carro.marca} | Ano: ${carro.ano} | Cor: ${carro.cor} | Preço: ${carro.preco} |` )

    response.status(200).send(dadosMapeados)
})

app.get('/massage/:email', (request, response) => {

    const email = request.params.email
   
    if(!email){
        response.status(400).send(JSON.stringify("Mensagem: Informe um email válido."))
    }

    const emailCheck = users.find((admin) => admin.email === email )

    if(!emailCheck){
        response.status(404).send(JSON.stringify("Mensagem: Email não encontrado, verifique ou crie uma conta."))
    }
    const emailFilter = massage.filter((massage) => massage.email === email  )

    if (emailFilter.length === 0) {
        response.status(400).send("Mensagem: Não existem recados para este email.");
        return;
    }


    response.status(200).send(emailFilter.map(massage => `| ID: ${massage.id} | Título: ${massage.title} | Descrição: ${massage.description} |`))
})

app.put('/massage/:id', (request, response) => {

    const title = request.body.title
    const description = request.body.description

    const id = Number(request.params.id)
   
    if(!id){
        response.status(400).send(JSON.stringify("Mensagem: Informe um id válido."))
    }

    const idVerification = massage.findIndex((massage) => massage.id === id )

    if(idVerification === -1){
        response.status(400).send(JSON.stringify("Por favor, informe um id válido da mensagem"))
    }
    else{
        massage[idVerification].title = title
        massage[idVerification].description = description
    }


    response.status(200).send(`Mensagem atualizada com sucesso => | ID: ${massage[idVerification].id} | Título: ${massage[idVerification].title} | Descrição: ${massage[idVerification].description} |`)
})

app.delete('/massage/:id', (request, response) => {

    const id = Number(request.params.id)
   
    if(!id){
        response.status(400).send(JSON.stringify("Mensagem: Informe um id válido."))
    }

    const idVerification = massage.findIndex((massage) => massage.id === id )

    if(idVerification === -1){
        response.status(400).send(JSON.stringify("Mensagem não encontrada, verifique o identificador em nosso banco"))
    }
    else{
        massage.splice(idVerification,1)
    }


    response.status(200).send(`Mensagem apagada com sucesso. `)
})
