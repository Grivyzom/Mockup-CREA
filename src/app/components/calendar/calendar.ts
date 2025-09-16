import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CalendarDate {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent implements OnInit {
  @Output() dateSelected = new EventEmitter<Date>();

  currentDate = new Date(2025, 8, 13); // 13 de septiembre de 2025
  today = new Date(2025, 8, 13);
  selectedDate: Date | null = null;
  
  currentMonth!: number;
  currentYear!: number;
  
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  calendarDates: CalendarDate[] = [];

  ngOnInit() {
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendar();
  }

  generateCalendar() {
    this.calendarDates = [];
    
    // Primer día del mes actual
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    
    // Días del mes anterior para completar la primera semana
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generar 42 días (6 semanas × 7 días)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const calendarDate: CalendarDate = {
        date: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isCurrentMonth: date.getMonth() === this.currentMonth,
        isToday: this.isSameDay(date, this.today),
        isSelected: this.selectedDate ? this.isSameDay(date, this.selectedDate) : false,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      };
      
      this.calendarDates.push(calendarDate);
    }
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  onDateClick(calendarDate: CalendarDate) {
    if (!calendarDate.isCurrentMonth) {
      // Si se hace clic en un día de otro mes, navegar a ese mes
      this.currentMonth = calendarDate.month;
      this.currentYear = calendarDate.year;
      this.generateCalendar();
      return;
    }
    
    const clickedDate = new Date(calendarDate.year, calendarDate.month, calendarDate.date);
    
    // Si la fecha ya está seleccionada, deseleccionarla
    if (this.selectedDate && this.isSameDay(clickedDate, this.selectedDate)) {
      this.selectedDate = null;
      this.generateCalendar();
      this.dateSelected.emit(null!); // Emitir null para indicar deselección
    } else {
      // Seleccionar la nueva fecha
      this.selectedDate = clickedDate;
      this.generateCalendar();
      this.dateSelected.emit(clickedDate);
    }
  }

  previousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }

  goToToday() {
    this.currentMonth = this.today.getMonth();
    this.currentYear = this.today.getFullYear();
    
    // Si el día de hoy ya está seleccionado, deseleccionarlo
    if (this.selectedDate && this.isSameDay(this.selectedDate, this.today)) {
      this.selectedDate = null;
      this.generateCalendar();
      this.dateSelected.emit(null!);
    } else {
      // Seleccionar el día de hoy
      this.selectedDate = new Date(this.today);
      this.generateCalendar();
      this.dateSelected.emit(this.selectedDate);
    }
  }

  get currentMonthName(): string {
    return this.monthNames[this.currentMonth];
  }

  get currentYearDisplay(): string {
    return this.currentYear.toString();
  }
}