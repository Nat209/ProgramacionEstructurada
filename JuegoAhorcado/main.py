from funciones import *
def main():
  
#Seleccionar palabra e inicializar alfabeto y jugada
    palabra = seleccionarpalabra()
    alfabeto = "a b c d e f g h i j k l m n ñ o p q r s t u v w x y z"
    jugada =["_"]*len(palabra)
  
    for turno in range(5):
      print(f"\nTurno:{turno+1}")
      print("-"*20)
      #Imprimir alfabeto y jugada
      imprimiractualizacion(alfabeto, jugada)
      #Entrada Usuario
      letra = entradausuario()
      #Actualizar jugada
      jugada = actualizarjugada(palabra, letra, jugada)
      alfabeto = actualizaralfabeto(letra, alfabeto)
      # Imprimir actualizacion
      imprimiractualizacion(alfabeto, jugada)
      # preguntar al usuario si desea adivinar o no la palabra
      check = input("Desea adivinar la palabra? (s/n): ")
      if check.lower () == "s":
        suposicion = input ("introduzca su respuesta:").lower()
        success = verificarjugada(suposicion, palabra)
    
        if success:
          print ("+"*20)
          print("SIUU GANOO")
          print ("+"*20)
          break
        else:
          print ("+"*20)
          print("NOOO ES INCORRECTA :(" )
          print ("+"*20)
    
      if turno == 4:
        print("-"*20)
        print(":( :( NOOOOOO AHORCADO")
        print("-"*20)
if __name__=="__main__":
  main ()