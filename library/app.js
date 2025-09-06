
        class LibrarySeatBooking {
            constructor() {
                this.seats = {};
                this.selectedSeat = null;
                this.currentBooking = null;
                this.floors = ['ground', 'first', 'second'];
                this.currentFloor = 'ground';
                
                this.initializeSeats();
                this.setupEventListeners();
                this.updateStats();
                this.updateTime();
                setInterval(() => this.updateTime(), 1000);
            }
            
            initializeSeats() {
                const sections = [
                    { id: 'readingSection', prefix: 'R', count: 32 },
                    { id: 'studySection', prefix: 'S', count: 24 },
                    { id: 'computerSection', prefix: 'C', count: 20 }
                ];
                
                this.floors.forEach(floor => {
                    this.seats[floor] = {};
                    sections.forEach(section => {
                        for (let i = 1; i <= section.count; i++) {
                            const seatId = `${section.prefix}${i.toString().padStart(2, '0')}`;
                            this.seats[floor][seatId] = {
                                id: seatId,
                                status: Math.random() > 0.3 ? 'available' : 'occupied',
                                student: null,
                                bookedUntil: null,
                                section: section.id
                            };
                        }
                    });
                });
                
                this.renderSeats();
            }
            
            renderSeats() {
                const sections = [
                    { id: 'readingSection', prefix: 'R', count: 32 },
                    { id: 'studySection', prefix: 'S', count: 24 },
                    { id: 'computerSection', prefix: 'C', count: 20 }
                ];
                
                sections.forEach(section => {
                    const container = document.getElementById(section.id);
                    container.innerHTML = '';
                    
                    for (let i = 1; i <= section.count; i++) {
                        const seatId = `${section.prefix}${i.toString().padStart(2, '0')}`;
                        const seat = this.seats[this.currentFloor][seatId];
                        
                        const seatElement = document.createElement('div');
                        seatElement.className = `seat ${seat.status} w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold`;
                        seatElement.textContent = i;
                        seatElement.dataset.seatId = seatId;
                        seatElement.title = `Seat ${seatId} - ${seat.status}`;
                        
                        if (seat.status === 'available') {
                            seatElement.addEventListener('click', () => this.selectSeat(seatId));
                        }
                        
                        container.appendChild(seatElement);
                    }
                });
                
                this.updateStats();
            }
            
            selectSeat(seatId) {
                // Clear previous selection
                if (this.selectedSeat) {
                    const prevElement = document.querySelector(`[data-seat-id="${this.selectedSeat}"]`);
                    if (prevElement) {
                        prevElement.classList.remove('selected');
                        prevElement.classList.add('available');
                    }
                }
                
                // Select new seat
                this.selectedSeat = seatId;
                const seatElement = document.querySelector(`[data-seat-id="${seatId}"]`);
                if (!seatElement) return;
                seatElement.classList.remove('available');
                seatElement.classList.add('selected');
                
                // Update form
                document.getElementById('selectedSeat').value = `${this.currentFloor.charAt(0).toUpperCase() + this.currentFloor.slice(1)} Floor - ${seatId}`;
                document.getElementById('bookButton').disabled = false;
            }
            
            bookSeat(studentName, studentId, duration) {
                if (!this.selectedSeat) return false;
                
                const seat = this.seats[this.currentFloor][this.selectedSeat];
                const now = new Date();
                const bookedUntil = new Date(now.getTime() + (duration * 60 * 60 * 1000));
                
                seat.status = 'occupied';
                seat.student = { name: studentName, id: studentId };
                seat.bookedUntil = bookedUntil;
                
                this.currentBooking = {
                    floor: this.currentFloor,
                    seatId: this.selectedSeat,
                    student: { name: studentName, id: studentId },
                    bookedUntil: bookedUntil
                };
                
                // Update UI
                const seatElement = document.querySelector(`[data-seat-id="${this.selectedSeat}"]`);
                if (seatElement) {
                    seatElement.classList.remove('selected');
                    seatElement.classList.add('occupied');
                    seatElement.title = `Seat ${this.selectedSeat} - Occupied by ${studentName}`;
                }
                
                this.selectedSeat = null;
                this.updateStats();
                this.showCurrentBooking();
                
                return true;
            }
            
            cancelBooking() {
                if (!this.currentBooking) return;
                
                const seat = this.seats[this.currentBooking.floor][this.currentBooking.seatId];
                seat.status = 'available';
                seat.student = null;
                seat.bookedUntil = null;
                
                // Update UI if on same floor
                if (this.currentBooking.floor === this.currentFloor) {
                    const seatElement = document.querySelector(`[data-seat-id="${this.currentBooking.seatId}"]`);
                    if (seatElement) {
                        seatElement.classList.remove('occupied');
                        seatElement.classList.add('available');
                        seatElement.title = `Seat ${this.currentBooking.seatId} - available`;
                    }
                }
                
                this.currentBooking = null;
                this.hideCurrentBooking();
                this.updateStats();
            }
            
            showCurrentBooking() {
                const bookingDiv = document.getElementById('currentBooking');
                const detailsDiv = document.getElementById('bookingDetails');
                
                detailsDiv.innerHTML = `
                    <div><strong>Seat:</strong> ${this.currentBooking.floor.charAt(0).toUpperCase() + this.currentBooking.floor.slice(1)} Floor - ${this.currentBooking.seatId}</div>
                    <div><strong>Student:</strong> ${this.currentBooking.student.name}</div>
                    <div><strong>ID:</strong> ${this.currentBooking.student.id}</div>
                    <div><strong>Until:</strong> ${this.currentBooking.bookedUntil.toLocaleTimeString()}</div>
                `;
                
                bookingDiv.classList.remove('hidden');
            }
            
            hideCurrentBooking() {
                document.getElementById('currentBooking').classList.add('hidden');
            }
            
            updateStats() {
                const currentFloorSeats = this.seats[this.currentFloor];
                const available = Object.values(currentFloorSeats).filter(seat => seat.status === 'available').length;
                const occupied = Object.values(currentFloorSeats).filter(seat => seat.status === 'occupied').length;
                const total = Object.keys(currentFloorSeats).length;
                
                document.getElementById('availableCount').textContent = available;
                document.getElementById('occupiedCount').textContent = occupied;
                document.getElementById('totalSeats').textContent = total;
            }
            
            updateTime() {
                const now = new Date();
                document.getElementById('currentTime').textContent = now.toLocaleTimeString();
            }
            
            setupEventListeners() {
                // Floor selection
                document.getElementById('floorSelect').addEventListener('change', (e) => {
                    this.currentFloor = e.target.value;
                    this.selectedSeat = null;
                    document.getElementById('selectedSeat').value = '';
                    document.getElementById('bookButton').disabled = true;
                    this.renderSeats();
                });
                
                // Booking form
                document.getElementById('bookingForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const studentName = document.getElementById('studentName').value;
                    const studentId = document.getElementById('studentId').value;
                    const duration = parseInt(document.getElementById('duration').value);
                    
                    if (this.bookSeat(studentName, studentId, duration)) {
                        // Reset form
                        document.getElementById('bookingForm').reset();
                        document.getElementById('selectedSeat').value = '';
                        document.getElementById('bookButton').disabled = true;
                        
                        alert(`Seat booked successfully! Your seat ${this.currentBooking.seatId} is reserved until ${this.currentBooking.bookedUntil.toLocaleTimeString()}`);
                    }
                });
                
                // Cancel booking
                document.getElementById('cancelBooking').addEventListener('click', () => {
                    if (confirm('Are you sure you want to cancel your booking?')) {
                        this.cancelBooking();
                        alert('Booking cancelled successfully!');
                    }
                });
            }
        }
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', () => {
            new LibrarySeatBooking();
        });
