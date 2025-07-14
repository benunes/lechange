// Singleton pour gérer les connexions SSE en mémoire
class MessageBroadcaster {
  private static instance: MessageBroadcaster;
  private connections: Map<string, Set<ReadableStreamDefaultController>> =
    new Map();

  static getInstance(): MessageBroadcaster {
    if (!MessageBroadcaster.instance) {
      MessageBroadcaster.instance = new MessageBroadcaster();
    }
    return MessageBroadcaster.instance;
  }

  addConnection(userId: string, controller: ReadableStreamDefaultController) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(controller);
    console.log(
      `✅ Connexion ajoutée pour l'utilisateur ${userId}. Total: ${this.connections.get(userId)!.size}`,
    );
  }

  removeConnection(
    userId: string,
    controller: ReadableStreamDefaultController,
  ) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(controller);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
      console.log(
        `❌ Connexion supprimée pour l'utilisateur ${userId}. Restant: ${userConnections.size}`,
      );
    }
  }

  broadcastToUsers(userIds: string[], data: any) {
    console.log(
      `📡 Broadcasting vers ${userIds.length} utilisateurs:`,
      userIds,
    );
    let sentCount = 0;

    userIds.forEach((userId) => {
      const userConnections = this.connections.get(userId);
      if (userConnections && userConnections.size > 0) {
        userConnections.forEach((controller) => {
          try {
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            sentCount++;
            console.log(`📨 Message envoyé à l'utilisateur ${userId}`);
          } catch (error) {
            console.error(`❌ Erreur envoi message à ${userId}:`, error);
            userConnections.delete(controller);
          }
        });
      } else {
        console.log(`🔌 Aucune connexion active pour l'utilisateur ${userId}`);
      }
    });

    console.log(
      `✅ Messages envoyés: ${sentCount} sur ${userIds.length} utilisateurs`,
    );
  }

  getConnectionsStatus() {
    const status: { [key: string]: number } = {};
    this.connections.forEach((connections, userId) => {
      status[userId] = connections.size;
    });
    return status;
  }
}

export const messageBroadcaster = MessageBroadcaster.getInstance();
